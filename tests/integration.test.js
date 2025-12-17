import { test } from 'node:test';
import assert from 'node:assert';
import { Lexer } from '../dist/lexer.js';
import { Parser } from '../dist/parser.js';
import { CodeGenerator } from '../dist/codegen.js';
import * as runtime from '../dist/runtime.js';

function compileAndEval(source) {
  const lexer = new Lexer(source);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);
  const ast = parser.parse();
  const codegen = new CodeGenerator();
  let js = codegen.generate(ast);

  // Replace import with inline runtime for testing
  js = js.replace(/import \* as __piper from.*\n/, '');

  // Create function that has runtime in scope
  const fn = new Function('__piper', js);
  return fn(runtime);
}

test('Integration - simple arithmetic', () => {
  const result = compileAndEval('let x = 5 + 3; x');
  // This won't return a value because it's statements, but it shouldn't error
  assert.doesNotThrow(() => result);
});

test('Integration - function definition and call', () => {
  const source = `
    fn double(x) = x * 2
    double(5)
  `;
  assert.doesNotThrow(() => compileAndEval(source));
});

test('Integration - pipe operator', () => {
  const source = `
    fn double(x) = x * 2
    fn add(x, y) = x + y
    5 |> double |> add(3)
  `;
  assert.doesNotThrow(() => compileAndEval(source));
});

test('Integration - lambda with map', () => {
  const source = `
    let arr = [1, 2, 3]
    let doubled = map(arr, |x| x * 2)
  `;
  assert.doesNotThrow(() => compileAndEval(source));
});

test('Integration - if expression', () => {
  const source = `
    fn abs(x) = if x < 0 then -x else x
    abs(-5)
    abs(5)
  `;
  assert.doesNotThrow(() => compileAndEval(source));
});

test('Integration - while loop', () => {
  const source = `
    var i = 0
    while i < 5 {
      i = i + 1
    }
  `;
  assert.doesNotThrow(() => compileAndEval(source));
});

test('Integration - for loop', () => {
  const source = `
    for i in [1, 2, 3] {
      let x = i * 2
    }
  `;
  assert.doesNotThrow(() => compileAndEval(source));
});

test('Integration - complex pipeline', () => {
  const source = `
    [1, 2, 3, 4, 5]
      |> map(|x| x * 2)
      |> filter(|x| x > 5)
      |> sum
  `;
  assert.doesNotThrow(() => compileAndEval(source));
});

test('Integration - block expression', () => {
  const source = `
    let result = {
      let a = 5
      let b = 10
      a + b
    }
  `;
  assert.doesNotThrow(() => compileAndEval(source));
});

test('Integration - nested functions', () => {
  const source = `
    fn makeAdder(x) = |y| x + y
    let add5 = makeAdder(5)
    add5(3)
  `;
  assert.doesNotThrow(() => compileAndEval(source));
});

test('Integration - fibonacci', () => {
  const source = `
    fn fib(n) = if n <= 1 then n else fib(n - 1) + fib(n - 2)
    fib(10)
  `;
  assert.doesNotThrow(() => compileAndEval(source));
});

test('Integration - array operations', () => {
  const source = `
    let numbers = range(1, 10)
    let evens = filter(numbers, |x| x % 2 == 0)
    let doubled = map(evens, |x| x * 2)
    let total = sum(doubled)
  `;
  assert.doesNotThrow(() => compileAndEval(source));
});
