import { test } from 'node:test';
import assert from 'node:assert';
import { Lexer } from '../dist/lexer.js';
import { Parser } from '../dist/parser.js';

function parse(source) {
  const lexer = new Lexer(source);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens, source);
  return parser.parse();
}

test('Parser - parse let declaration', () => {
  const ast = parse('let x = 42');

  assert.strictEqual(ast.type, 'Program');
  assert.strictEqual(ast.body.length, 1);
  assert.strictEqual(ast.body[0].type, 'LetDeclaration');
  assert.strictEqual(ast.body[0].name, 'x');
  assert.strictEqual(ast.body[0].init.type, 'Literal');
  assert.strictEqual(ast.body[0].init.value, 42);
});

test('Parser - parse var declaration', () => {
  const ast = parse('var x = 42');

  assert.strictEqual(ast.body[0].type, 'VarDeclaration');
  assert.strictEqual(ast.body[0].name, 'x');
});

test('Parser - parse function declaration (expression style)', () => {
  const ast = parse('fn double(x) = x * 2');

  assert.strictEqual(ast.body[0].type, 'FunctionDeclaration');
  assert.strictEqual(ast.body[0].name, 'double');
  assert.deepStrictEqual(ast.body[0].params, ['x']);
  assert.strictEqual(ast.body[0].isExpression, true);
  assert.strictEqual(ast.body[0].body.type, 'BinaryExpression');
});

test('Parser - parse function declaration (block style)', () => {
  const ast = parse('fn add(a, b) { a + b }');

  assert.strictEqual(ast.body[0].type, 'FunctionDeclaration');
  assert.strictEqual(ast.body[0].name, 'add');
  assert.deepStrictEqual(ast.body[0].params, ['a', 'b']);
  assert.strictEqual(ast.body[0].isExpression, false);
  assert.strictEqual(ast.body[0].body.type, 'BlockExpression');
});

test('Parser - parse binary expressions', () => {
  const ast = parse('1 + 2 * 3');

  const expr = ast.body[0].expression;
  assert.strictEqual(expr.type, 'BinaryExpression');
  assert.strictEqual(expr.operator, '+');
  assert.strictEqual(expr.left.type, 'Literal');
  assert.strictEqual(expr.left.value, 1);

  assert.strictEqual(expr.right.type, 'BinaryExpression');
  assert.strictEqual(expr.right.operator, '*');
  assert.strictEqual(expr.right.left.value, 2);
  assert.strictEqual(expr.right.right.value, 3);
});

test('Parser - parse pipe expression', () => {
  const ast = parse('5 |> double');

  const expr = ast.body[0].expression;
  assert.strictEqual(expr.type, 'PipeExpression');
  assert.strictEqual(expr.left.type, 'Literal');
  assert.strictEqual(expr.left.value, 5);
  assert.strictEqual(expr.right.type, 'Identifier');
  assert.strictEqual(expr.right.name, 'double');
});

test('Parser - parse pipe with call expression', () => {
  const ast = parse('5 |> add(3)');

  const expr = ast.body[0].expression;
  assert.strictEqual(expr.type, 'PipeExpression');
  assert.strictEqual(expr.right.type, 'CallExpression');
  assert.strictEqual(expr.right.callee.name, 'add');
  assert.strictEqual(expr.right.args.length, 1);
});

test('Parser - parse lambda', () => {
  const ast = parse('|x| x * 2');

  const expr = ast.body[0].expression;
  assert.strictEqual(expr.type, 'Lambda');
  assert.deepStrictEqual(expr.params, ['x']);
  assert.strictEqual(expr.body.type, 'BinaryExpression');
});

test('Parser - parse lambda with multiple params', () => {
  const ast = parse('|x, y| x + y');

  const expr = ast.body[0].expression;
  assert.strictEqual(expr.type, 'Lambda');
  assert.deepStrictEqual(expr.params, ['x', 'y']);
});

test('Parser - parse lambda with block body', () => {
  const ast = parse('|x| { let y = x * 2; y }');

  const expr = ast.body[0].expression;
  assert.strictEqual(expr.type, 'Lambda');
  assert.strictEqual(expr.body.type, 'BlockExpression');
});

test('Parser - parse if expression', () => {
  const ast = parse('if x > 0 then x else -x');

  const expr = ast.body[0].expression;
  assert.strictEqual(expr.type, 'IfExpression');
  assert.strictEqual(expr.condition.type, 'BinaryExpression');
  assert.strictEqual(expr.thenBranch.type, 'Identifier');
  assert.strictEqual(expr.elseBranch.type, 'UnaryExpression');
});

test('Parser - parse if with block', () => {
  const ast = parse('if x > 0 { x } else { -x }');

  const expr = ast.body[0].expression;
  assert.strictEqual(expr.type, 'IfExpression');
  assert.strictEqual(expr.thenBranch.type, 'BlockExpression');
  assert.strictEqual(expr.elseBranch.type, 'BlockExpression');
});

test('Parser - parse while statement', () => {
  const ast = parse('while x > 0 { x = x - 1 }');

  assert.strictEqual(ast.body[0].type, 'WhileStatement');
  assert.strictEqual(ast.body[0].condition.type, 'BinaryExpression');
  assert.strictEqual(ast.body[0].body.type, 'BlockExpression');
});

test('Parser - parse for statement', () => {
  const ast = parse('for i in [1, 2, 3] { print(i) }');

  assert.strictEqual(ast.body[0].type, 'ForStatement');
  assert.strictEqual(ast.body[0].variable, 'i');
  assert.strictEqual(ast.body[0].iterable.type, 'ArrayLiteral');
  assert.strictEqual(ast.body[0].body.type, 'BlockExpression');
});

test('Parser - parse array literal', () => {
  const ast = parse('[1, 2, 3]');

  const expr = ast.body[0].expression;
  assert.strictEqual(expr.type, 'ArrayLiteral');
  assert.strictEqual(expr.elements.length, 3);
  assert.strictEqual(expr.elements[0].value, 1);
  assert.strictEqual(expr.elements[1].value, 2);
  assert.strictEqual(expr.elements[2].value, 3);
});

test('Parser - parse call expression', () => {
  const ast = parse('print(42, "hello")');

  const expr = ast.body[0].expression;
  assert.strictEqual(expr.type, 'CallExpression');
  assert.strictEqual(expr.callee.name, 'print');
  assert.strictEqual(expr.args.length, 2);
});

test('Parser - parse block expression', () => {
  const ast = parse('{ let x = 5; x * 2 }');

  const expr = ast.body[0].expression;
  assert.strictEqual(expr.type, 'BlockExpression');
  assert.strictEqual(expr.statements.length, 2);
  assert.strictEqual(expr.statements[0].type, 'LetDeclaration');
  assert.strictEqual(expr.statements[1].type, 'ExpressionStatement');
});

test('Parser - parse assignment', () => {
  const ast = parse('x = 42');

  assert.strictEqual(ast.body[0].type, 'Assignment');
  assert.strictEqual(ast.body[0].name, 'x');
  assert.strictEqual(ast.body[0].value.type, 'Literal');
});
