// Lexer/Tokenizer for Piper Language

import { SourceLocation } from './ast.js';

export enum TokenType {
  // Literals
  NUMBER = 'NUMBER',
  STRING = 'STRING',
  TRUE = 'TRUE',
  FALSE = 'FALSE',
  NULL = 'NULL',

  // Identifiers and keywords
  IDENTIFIER = 'IDENTIFIER',
  LET = 'LET',
  VAR = 'VAR',
  FN = 'FN',
  IF = 'IF',
  THEN = 'THEN',
  ELSE = 'ELSE',
  WHILE = 'WHILE',
  FOR = 'FOR',
  IN = 'IN',
  RETURN = 'RETURN',

  // Operators
  PLUS = 'PLUS',
  MINUS = 'MINUS',
  STAR = 'STAR',
  SLASH = 'SLASH',
  PERCENT = 'PERCENT',
  EQ = 'EQ',
  EQEQ = 'EQEQ',
  NEQ = 'NEQ',
  LT = 'LT',
  LTE = 'LTE',
  GT = 'GT',
  GTE = 'GTE',
  AND = 'AND',
  OR = 'OR',
  NOT = 'NOT',
  PIPE = 'PIPE',

  // Delimiters
  LPAREN = 'LPAREN',
  RPAREN = 'RPAREN',
  LBRACE = 'LBRACE',
  RBRACE = 'RBRACE',
  LBRACKET = 'LBRACKET',
  RBRACKET = 'RBRACKET',
  COMMA = 'COMMA',
  SEMICOLON = 'SEMICOLON',
  ARROW = 'ARROW',

  // Special
  EOF = 'EOF',
  NEWLINE = 'NEWLINE',
}

export interface Token {
  type: TokenType;
  value: string;
  loc: SourceLocation;
}

const KEYWORDS: Record<string, TokenType> = {
  let: TokenType.LET,
  var: TokenType.VAR,
  fn: TokenType.FN,
  if: TokenType.IF,
  then: TokenType.THEN,
  else: TokenType.ELSE,
  while: TokenType.WHILE,
  for: TokenType.FOR,
  in: TokenType.IN,
  return: TokenType.RETURN,
  true: TokenType.TRUE,
  false: TokenType.FALSE,
  null: TokenType.NULL,
};

export class Lexer {
  private source: string;
  private pos: number = 0;
  private line: number = 1;
  private column: number = 1;

  constructor(source: string) {
    this.source = source;
  }

  private get current(): string {
    return this.source[this.pos] || '\0';
  }

  private peek(offset: number = 1): string {
    return this.source[this.pos + offset] || '\0';
  }

  private advance(): string {
    const ch = this.current;
    this.pos++;
    if (ch === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return ch;
  }

  private skipWhitespace(): void {
    while (this.current === ' ' || this.current === '\t' || this.current === '\r') {
      this.advance();
    }
  }

  private skipComment(): void {
    const ch = this.current;
    if (ch === '/' && this.peek() === '/') {
      // Skip the '//' characters
      this.pos += 2;
      this.column += 2;
      // Skip until end of line
      while (this.source[this.pos] !== '\n' && this.source[this.pos] !== '\0') {
        this.advance();
      }
    }
  }

  private readNumber(): Token {
    const start = { line: this.line, column: this.column };
    let value = '';

    while (/[0-9]/.test(this.current)) {
      value += this.advance();
    }

    if (this.current === '.' && /[0-9]/.test(this.peek())) {
      value += this.advance(); // consume '.'
      while (/[0-9]/.test(this.current)) {
        value += this.advance();
      }
    }

    return { type: TokenType.NUMBER, value, loc: start };
  }

  private readString(): Token {
    const start = { line: this.line, column: this.column };
    const quote = this.advance(); // consume opening quote
    let value = '';

    while (this.current !== quote && this.current !== '\0') {
      if (this.current === '\\') {
        this.advance();
        const next = this.advance();
        switch (next) {
          case 'n': value += '\n'; break;
          case 't': value += '\t'; break;
          case 'r': value += '\r'; break;
          case '\\': value += '\\'; break;
          case quote: value += quote; break;
          default: value += next;
        }
      } else {
        value += this.advance();
      }
    }

    if (this.current === '\0') {
      throw new Error(`Unterminated string at line ${start.line}, column ${start.column}`);
    }

    this.advance(); // consume closing quote
    return { type: TokenType.STRING, value, loc: start };
  }

  private readIdentifier(): Token {
    const start = { line: this.line, column: this.column };
    let value = '';

    while (/[a-zA-Z0-9_]/.test(this.current)) {
      value += this.advance();
    }

    const type = KEYWORDS[value] || TokenType.IDENTIFIER;
    return { type, value, loc: start };
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];

    while (this.current !== '\0') {
      this.skipWhitespace();
      this.skipComment();

      if (this.current === '\0') break;

      const loc = { line: this.line, column: this.column };

      // Newlines (significant for statement separation)
      if (this.current === '\n') {
        this.advance();
        tokens.push({ type: TokenType.NEWLINE, value: '\\n', loc });
        continue;
      }

      // Numbers
      if (/[0-9]/.test(this.current)) {
        tokens.push(this.readNumber());
        continue;
      }

      // Strings
      if (this.current === '"' || this.current === "'") {
        tokens.push(this.readString());
        continue;
      }

      // Identifiers and keywords
      if (/[a-zA-Z_]/.test(this.current)) {
        tokens.push(this.readIdentifier());
        continue;
      }

      // Two-character operators
      if (this.current === '=' && this.peek() === '=') {
        this.advance();
        this.advance();
        tokens.push({ type: TokenType.EQEQ, value: '==', loc });
        continue;
      }

      if (this.current === '!' && this.peek() === '=') {
        this.advance();
        this.advance();
        tokens.push({ type: TokenType.NEQ, value: '!=', loc });
        continue;
      }

      if (this.current === '<' && this.peek() === '=') {
        this.advance();
        this.advance();
        tokens.push({ type: TokenType.LTE, value: '<=', loc });
        continue;
      }

      if (this.current === '>' && this.peek() === '=') {
        this.advance();
        this.advance();
        tokens.push({ type: TokenType.GTE, value: '>=', loc });
        continue;
      }

      if (this.current === '&' && this.peek() === '&') {
        this.advance();
        this.advance();
        tokens.push({ type: TokenType.AND, value: '&&', loc });
        continue;
      }

      if (this.current === '|' && this.peek() === '|') {
        this.advance();
        this.advance();
        tokens.push({ type: TokenType.OR, value: '||', loc });
        continue;
      }

      if (this.current === '|' && this.peek() === '>') {
        this.advance();
        this.advance();
        tokens.push({ type: TokenType.PIPE, value: '|>', loc });
        continue;
      }

      if (this.current === '-' && this.peek() === '>') {
        this.advance();
        this.advance();
        tokens.push({ type: TokenType.ARROW, value: '->', loc });
        continue;
      }

      // Single-character tokens
      const char = this.advance();
      switch (char) {
        case '+': tokens.push({ type: TokenType.PLUS, value: '+', loc }); break;
        case '-': tokens.push({ type: TokenType.MINUS, value: '-', loc }); break;
        case '*': tokens.push({ type: TokenType.STAR, value: '*', loc }); break;
        case '/': tokens.push({ type: TokenType.SLASH, value: '/', loc }); break;
        case '%': tokens.push({ type: TokenType.PERCENT, value: '%', loc }); break;
        case '=': tokens.push({ type: TokenType.EQ, value: '=', loc }); break;
        case '<': tokens.push({ type: TokenType.LT, value: '<', loc }); break;
        case '>': tokens.push({ type: TokenType.GT, value: '>', loc }); break;
        case '!': tokens.push({ type: TokenType.NOT, value: '!', loc }); break;
        case '(': tokens.push({ type: TokenType.LPAREN, value: '(', loc }); break;
        case ')': tokens.push({ type: TokenType.RPAREN, value: ')', loc }); break;
        case '{': tokens.push({ type: TokenType.LBRACE, value: '{', loc }); break;
        case '}': tokens.push({ type: TokenType.RBRACE, value: '}', loc }); break;
        case '[': tokens.push({ type: TokenType.LBRACKET, value: '[', loc }); break;
        case ']': tokens.push({ type: TokenType.RBRACKET, value: ']', loc }); break;
        case ',': tokens.push({ type: TokenType.COMMA, value: ',', loc }); break;
        case ';': tokens.push({ type: TokenType.SEMICOLON, value: ';', loc }); break;
        case '|': tokens.push({ type: TokenType.PIPE, value: '|', loc }); break;
        default:
          throw new Error(`Unexpected character '${char}' at line ${loc.line}, column ${loc.column}`);
      }
    }

    tokens.push({ type: TokenType.EOF, value: '', loc: { line: this.line, column: this.column } });
    return tokens;
  }
}
