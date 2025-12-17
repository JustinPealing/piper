import { test } from 'node:test';
import assert from 'node:assert';
import { Lexer, TokenType } from '../dist/lexer.js';

test('Lexer - tokenize numbers', () => {
  const lexer = new Lexer('42 3.14');
  const tokens = lexer.tokenize();

  assert.strictEqual(tokens[0].type, TokenType.NUMBER);
  assert.strictEqual(tokens[0].value, '42');

  assert.strictEqual(tokens[1].type, TokenType.NUMBER);
  assert.strictEqual(tokens[1].value, '3.14');

  assert.strictEqual(tokens[2].type, TokenType.EOF);
});

test('Lexer - tokenize strings', () => {
  const lexer = new Lexer('"hello" \'world\'');
  const tokens = lexer.tokenize();

  assert.strictEqual(tokens[0].type, TokenType.STRING);
  assert.strictEqual(tokens[0].value, 'hello');

  assert.strictEqual(tokens[1].type, TokenType.STRING);
  assert.strictEqual(tokens[1].value, 'world');

  assert.strictEqual(tokens[2].type, TokenType.EOF);
});

test('Lexer - tokenize identifiers and keywords', () => {
  const lexer = new Lexer('let var fn if then else');
  const tokens = lexer.tokenize();

  assert.strictEqual(tokens[0].type, TokenType.LET);
  assert.strictEqual(tokens[1].type, TokenType.VAR);
  assert.strictEqual(tokens[2].type, TokenType.FN);
  assert.strictEqual(tokens[3].type, TokenType.IF);
  assert.strictEqual(tokens[4].type, TokenType.THEN);
  assert.strictEqual(tokens[5].type, TokenType.ELSE);
});

test('Lexer - tokenize operators', () => {
  const lexer = new Lexer('+ - * / == != < <= > >= && || |>');
  const tokens = lexer.tokenize();

  assert.strictEqual(tokens[0].type, TokenType.PLUS);
  assert.strictEqual(tokens[1].type, TokenType.MINUS);
  assert.strictEqual(tokens[2].type, TokenType.STAR);
  assert.strictEqual(tokens[3].type, TokenType.SLASH);
  assert.strictEqual(tokens[4].type, TokenType.EQEQ);
  assert.strictEqual(tokens[5].type, TokenType.NEQ);
  assert.strictEqual(tokens[6].type, TokenType.LT);
  assert.strictEqual(tokens[7].type, TokenType.LTE);
  assert.strictEqual(tokens[8].type, TokenType.GT);
  assert.strictEqual(tokens[9].type, TokenType.GTE);
  assert.strictEqual(tokens[10].type, TokenType.AND);
  assert.strictEqual(tokens[11].type, TokenType.OR);
  assert.strictEqual(tokens[12].type, TokenType.PIPE);
});

test('Lexer - tokenize delimiters', () => {
  const lexer = new Lexer('( ) { } [ ] , ;');
  const tokens = lexer.tokenize();

  assert.strictEqual(tokens[0].type, TokenType.LPAREN);
  assert.strictEqual(tokens[1].type, TokenType.RPAREN);
  assert.strictEqual(tokens[2].type, TokenType.LBRACE);
  assert.strictEqual(tokens[3].type, TokenType.RBRACE);
  assert.strictEqual(tokens[4].type, TokenType.LBRACKET);
  assert.strictEqual(tokens[5].type, TokenType.RBRACKET);
  assert.strictEqual(tokens[6].type, TokenType.COMMA);
  assert.strictEqual(tokens[7].type, TokenType.SEMICOLON);
});

test('Lexer - skip comments', () => {
  const lexer = new Lexer('42 // this is a comment\n3.14');
  const tokens = lexer.tokenize();

  assert.strictEqual(tokens[0].type, TokenType.NUMBER);
  assert.strictEqual(tokens[0].value, '42');

  // tokens[1] is NEWLINE, tokens[2] is the number
  assert.strictEqual(tokens[2].type, TokenType.NUMBER);
  assert.strictEqual(tokens[2].value, '3.14');
});

test('Lexer - track line and column', () => {
  const lexer = new Lexer('let x\n= 42');
  const tokens = lexer.tokenize();

  assert.strictEqual(tokens[0].loc.line, 1);
  assert.strictEqual(tokens[0].loc.column, 1);

  // tokens[2] is NEWLINE, tokens[3] is EQ on line 2
  assert.strictEqual(tokens[3].loc.line, 2);
  assert.strictEqual(tokens[3].loc.column, 1);
});

test('Lexer - handle escape sequences in strings', () => {
  const lexer = new Lexer('"hello\\nworld"');
  const tokens = lexer.tokenize();

  assert.strictEqual(tokens[0].type, TokenType.STRING);
  assert.strictEqual(tokens[0].value, 'hello\nworld');
});
