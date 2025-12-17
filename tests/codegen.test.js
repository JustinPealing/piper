import { test } from 'node:test';
import assert from 'node:assert';
import { Lexer } from '../dist/lexer.js';
import { Parser } from '../dist/parser.js';
import { CodeGenerator } from '../dist/codegen.js';

function compile(source) {
  const lexer = new Lexer(source);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  const codegen = new CodeGenerator();
  return codegen.generate(ast);
}

test('CodeGen - let declaration', () => {
  const js = compile('let x = 42');
  assert.match(js, /const x = 42/);
});

test('CodeGen - var declaration', () => {
  const js = compile('var x = 42');
  assert.match(js, /let x = 42/);
});

test('CodeGen - function declaration (expression style)', () => {
  const js = compile('fn double(x) = x * 2');
  assert.match(js, /function double\(x\)/);
  assert.match(js, /return \(x \* 2\)/);
});

test('CodeGen - function declaration (block style)', () => {
  const js = compile('fn add(a, b) { a + b }');
  assert.match(js, /function add\(a, b\)/);
});

test('CodeGen - binary expressions', () => {
  const js = compile('1 + 2 * 3');
  assert.match(js, /\(1 \+ \(2 \* 3\)\)/);
});

test('CodeGen - pipe expression with identifier', () => {
  const js = compile('5 |> double');
  assert.match(js, /double\(5\)/);
});

test('CodeGen - pipe expression with call', () => {
  const js = compile('5 |> add(3)');
  assert.match(js, /add\(5, 3\)/);
});

test('CodeGen - chained pipe', () => {
  const js = compile('[1,2,3] |> map(|x| x * 2) |> sum');
  assert.match(js, /sum\(__piper\.map\(\[1, 2, 3\]/);
});

test('CodeGen - lambda', () => {
  const js = compile('|x| x * 2');
  assert.match(js, /\(\(x\) => \(x \* 2\)\)/);
});

test('CodeGen - lambda with block', () => {
  const js = compile('|x| { let y = x * 2; y }');
  assert.match(js, /\(\(x\) => \{/);
  assert.match(js, /const y = \(x \* 2\)/);
});

test('CodeGen - if expression', () => {
  const js = compile('if x > 0 then x else -x');
  assert.match(js, /\(\(x > 0\) \? x : \(-x\)\)/);
});

test('CodeGen - while statement', () => {
  const js = compile('while x > 0 { x = x - 1 }');
  assert.match(js, /while \(\(x > 0\)\)/);
});

test('CodeGen - for statement', () => {
  const js = compile('for i in [1,2,3] { print(i) }');
  assert.match(js, /for \(const i of \[1, 2, 3\]\)/);
});

test('CodeGen - array literal', () => {
  const js = compile('[1, 2, 3]');
  assert.match(js, /\[1, 2, 3\]/);
});

test('CodeGen - call expression with built-in', () => {
  const js = compile('print(42)');
  assert.match(js, /__piper\.print\(42\)/);
});

test('CodeGen - block expression returns last value', () => {
  const js = compile('{ let x = 5; x * 2 }');
  assert.match(js, /return \(x \* 2\)/);
});

test('CodeGen - equality operators use strict comparison', () => {
  const js = compile('x == y');
  assert.match(js, /x === y/);

  const js2 = compile('x != y');
  assert.match(js2, /x !== y/);
});

test('CodeGen - includes runtime import', () => {
  const js = compile('print(42)');
  assert.match(js, /import \* as __piper from/);
});
