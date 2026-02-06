// Recursive Descent Parser for Piper Language

import { Token, TokenType } from './lexer.js';
import * as AST from './ast.js';
import { PiperError, TOKEN_DISPLAY_NAMES } from './errors.js';

export class Parser {
  private tokens: Token[];
  private source: string;
  private pos: number = 0;

  constructor(tokens: Token[], source: string = '') {
    // Filter out NEWLINE tokens for easier parsing
    this.tokens = tokens.filter(t => t.type !== TokenType.NEWLINE);
    this.source = source;
  }

  private get current(): Token {
    return this.tokens[this.pos] || this.tokens[this.tokens.length - 1];
  }

  private peek(offset: number = 1): Token {
    return this.tokens[this.pos + offset] || this.tokens[this.tokens.length - 1];
  }

  private advance(): Token {
    return this.tokens[this.pos++];
  }

  private expect(type: TokenType): Token {
    const token = this.current;
    if (token.type !== type) {
      const expected = TOKEN_DISPLAY_NAMES[type] || type;
      const got = TOKEN_DISPLAY_NAMES[token.type] || token.type;
      throw new PiperError(
        `Expected ${expected} but found ${got}`,
        this.source,
        token.loc.line,
        token.loc.column,
      );
    }
    return this.advance();
  }

  private match(...types: TokenType[]): boolean {
    return types.includes(this.current.type);
  }

  public parse(): AST.Program {
    const body: AST.ASTNode[] = [];

    while (this.current.type !== TokenType.EOF) {
      body.push(this.parseStatement());
    }

    return {
      type: 'Program',
      body,
    };
  }

  private parseStatement(): AST.ASTNode {
    // Declarations
    if (this.match(TokenType.LET)) {
      return this.parseLetDeclaration();
    }
    if (this.match(TokenType.VAR)) {
      return this.parseVarDeclaration();
    }
    if (this.match(TokenType.FN)) {
      return this.parseFunctionDeclaration();
    }
    if (this.match(TokenType.RETURN)) {
      return this.parseReturnStatement();
    }
    if (this.match(TokenType.WHILE)) {
      return this.parseWhileStatement();
    }
    if (this.match(TokenType.FOR)) {
      return this.parseForStatement();
    }

    // Assignment or expression statement
    if (this.current.type === TokenType.IDENTIFIER && this.peek().type === TokenType.EQ) {
      return this.parseAssignment();
    }

    // Expression statement
    const expr = this.parseExpression();

    // Optional semicolon
    if (this.match(TokenType.SEMICOLON)) {
      this.advance();
    }

    return {
      type: 'ExpressionStatement',
      expression: expr,
      loc: expr.loc,
    };
  }

  private parseLetDeclaration(): AST.LetDeclaration {
    const loc = this.advance().loc; // consume 'let'
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.EQ);
    const init = this.parseExpression();

    if (this.match(TokenType.SEMICOLON)) {
      this.advance();
    }

    return { type: 'LetDeclaration', name, init, loc };
  }

  private parseVarDeclaration(): AST.VarDeclaration {
    const loc = this.advance().loc; // consume 'var'
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.EQ);
    const init = this.parseExpression();

    if (this.match(TokenType.SEMICOLON)) {
      this.advance();
    }

    return { type: 'VarDeclaration', name, init, loc };
  }

  private parseFunctionDeclaration(): AST.FunctionDeclaration {
    const loc = this.advance().loc; // consume 'fn'
    const name = this.expect(TokenType.IDENTIFIER).value;

    this.expect(TokenType.LPAREN);
    const params: string[] = [];

    if (!this.match(TokenType.RPAREN)) {
      do {
        if (this.match(TokenType.COMMA)) {
          this.advance();
        }
        params.push(this.expect(TokenType.IDENTIFIER).value);
      } while (this.match(TokenType.COMMA));
    }

    this.expect(TokenType.RPAREN);

    // Expression-style: fn f(x) = x * 2
    if (this.match(TokenType.EQ)) {
      this.advance();
      const body = this.parseExpression();

      if (this.match(TokenType.SEMICOLON)) {
        this.advance();
      }

      return {
        type: 'FunctionDeclaration',
        name,
        params,
        body,
        isExpression: true,
        loc,
      };
    }

    // Block-style: fn f(x) { ... }
    const body = this.parseBlockExpression();

    return {
      type: 'FunctionDeclaration',
      name,
      params,
      body,
      isExpression: false,
      loc,
    };
  }

  private parseAssignment(): AST.Assignment {
    const loc = this.current.loc;
    const name = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.EQ);
    const value = this.parseExpression();

    if (this.match(TokenType.SEMICOLON)) {
      this.advance();
    }

    return { type: 'Assignment', name, value, loc };
  }

  private parseReturnStatement(): AST.ReturnStatement {
    const loc = this.advance().loc; // consume 'return'

    if (this.match(TokenType.SEMICOLON, TokenType.RBRACE, TokenType.EOF)) {
      return { type: 'ReturnStatement', loc };
    }

    const value = this.parseExpression();

    if (this.match(TokenType.SEMICOLON)) {
      this.advance();
    }

    return { type: 'ReturnStatement', value, loc };
  }

  private parseWhileStatement(): AST.WhileStatement {
    const loc = this.advance().loc; // consume 'while'
    const condition = this.parseExpression();
    const body = this.parseBlockExpression();

    return { type: 'WhileStatement', condition, body, loc };
  }

  private parseForStatement(): AST.ForStatement {
    const loc = this.advance().loc; // consume 'for'
    const variable = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.IN);
    const iterable = this.parseExpression();
    const body = this.parseBlockExpression();

    return { type: 'ForStatement', variable, iterable, body, loc };
  }

  private parseExpression(): AST.ASTNode {
    return this.parsePipe();
  }

  private parsePipe(): AST.ASTNode {
    let left = this.parseLogicalOr();

    while (this.match(TokenType.PIPE)) {
      const loc = this.advance().loc;
      const right = this.parseLogicalOr();

      left = {
        type: 'PipeExpression',
        left,
        right,
        loc,
      };
    }

    return left;
  }

  private parseLogicalOr(): AST.ASTNode {
    let left = this.parseLogicalAnd();

    while (this.match(TokenType.OR)) {
      const operator = this.advance().value;
      const right = this.parseLogicalAnd();

      left = {
        type: 'BinaryExpression',
        operator,
        left,
        right,
        loc: left.loc,
      };
    }

    return left;
  }

  private parseLogicalAnd(): AST.ASTNode {
    let left = this.parseEquality();

    while (this.match(TokenType.AND)) {
      const operator = this.advance().value;
      const right = this.parseEquality();

      left = {
        type: 'BinaryExpression',
        operator,
        left,
        right,
        loc: left.loc,
      };
    }

    return left;
  }

  private parseEquality(): AST.ASTNode {
    let left = this.parseComparison();

    while (this.match(TokenType.EQEQ, TokenType.NEQ)) {
      const operator = this.advance().value;
      const right = this.parseComparison();

      left = {
        type: 'BinaryExpression',
        operator,
        left,
        right,
        loc: left.loc,
      };
    }

    return left;
  }

  private parseComparison(): AST.ASTNode {
    let left = this.parseAdditive();

    while (this.match(TokenType.LT, TokenType.LTE, TokenType.GT, TokenType.GTE)) {
      const operator = this.advance().value;
      const right = this.parseAdditive();

      left = {
        type: 'BinaryExpression',
        operator,
        left,
        right,
        loc: left.loc,
      };
    }

    return left;
  }

  private parseAdditive(): AST.ASTNode {
    let left = this.parseMultiplicative();

    while (this.match(TokenType.PLUS, TokenType.MINUS)) {
      const operator = this.advance().value;
      const right = this.parseMultiplicative();

      left = {
        type: 'BinaryExpression',
        operator,
        left,
        right,
        loc: left.loc,
      };
    }

    return left;
  }

  private parseMultiplicative(): AST.ASTNode {
    let left = this.parseUnary();

    while (this.match(TokenType.STAR, TokenType.SLASH, TokenType.PERCENT)) {
      const operator = this.advance().value;
      const right = this.parseUnary();

      left = {
        type: 'BinaryExpression',
        operator,
        left,
        right,
        loc: left.loc,
      };
    }

    return left;
  }

  private parseUnary(): AST.ASTNode {
    if (this.match(TokenType.NOT, TokenType.MINUS)) {
      const loc = this.current.loc;
      const operator = this.advance().value;
      const operand = this.parseUnary();

      return {
        type: 'UnaryExpression',
        operator,
        operand,
        loc,
      };
    }

    return this.parseCall();
  }

  private parseCall(): AST.ASTNode {
    let expr = this.parsePrimary();

    while (this.match(TokenType.LPAREN)) {
      const loc = expr.loc;
      this.advance(); // consume '('

      const args: AST.ASTNode[] = [];

      if (!this.match(TokenType.RPAREN)) {
        do {
          if (this.match(TokenType.COMMA)) {
            this.advance();
          }
          args.push(this.parseExpression());
        } while (this.match(TokenType.COMMA));
      }

      this.expect(TokenType.RPAREN);

      expr = {
        type: 'CallExpression',
        callee: expr,
        args,
        loc,
      };
    }

    return expr;
  }

  private parsePrimary(): AST.ASTNode {
    const token = this.current;

    // If expression
    if (this.match(TokenType.IF)) {
      return this.parseIfExpression();
    }

    // Block expression
    if (this.match(TokenType.LBRACE)) {
      return this.parseBlockExpression();
    }

    // Lambda
    if (this.match(TokenType.PIPE)) {
      return this.parseLambda();
    }

    // Array literal
    if (this.match(TokenType.LBRACKET)) {
      return this.parseArrayLiteral();
    }

    // Parenthesized expression
    if (this.match(TokenType.LPAREN)) {
      this.advance();
      const expr = this.parseExpression();
      this.expect(TokenType.RPAREN);
      return expr;
    }

    // Literals
    if (this.match(TokenType.NUMBER)) {
      this.advance();
      return {
        type: 'Literal',
        value: parseFloat(token.value),
        raw: token.value,
        loc: token.loc,
      };
    }

    if (this.match(TokenType.STRING)) {
      this.advance();
      return {
        type: 'Literal',
        value: token.value,
        raw: `"${token.value}"`,
        loc: token.loc,
      };
    }

    if (this.match(TokenType.TRUE)) {
      this.advance();
      return {
        type: 'Literal',
        value: true,
        raw: 'true',
        loc: token.loc,
      };
    }

    if (this.match(TokenType.FALSE)) {
      this.advance();
      return {
        type: 'Literal',
        value: false,
        raw: 'false',
        loc: token.loc,
      };
    }

    if (this.match(TokenType.NULL)) {
      this.advance();
      return {
        type: 'Literal',
        value: null,
        raw: 'null',
        loc: token.loc,
      };
    }

    // Identifier
    if (this.match(TokenType.IDENTIFIER)) {
      this.advance();
      return {
        type: 'Identifier',
        name: token.value,
        loc: token.loc,
      };
    }

    const display = TOKEN_DISPLAY_NAMES[token.type] || token.type;
    throw new PiperError(
      `Unexpected token ${display}`,
      this.source,
      token.loc.line,
      token.loc.column,
    );
  }

  private parseIfExpression(): AST.IfExpression {
    const loc = this.advance().loc; // consume 'if'
    const condition = this.parseExpression();

    // 'then' keyword is optional if followed by '{'
    if (this.match(TokenType.THEN)) {
      this.advance();
    }

    const thenBranch = this.match(TokenType.LBRACE)
      ? this.parseBlockExpression()
      : this.parseExpression();

    let elseBranch: AST.ASTNode | undefined;

    if (this.match(TokenType.ELSE)) {
      this.advance();
      elseBranch = this.match(TokenType.LBRACE) || this.match(TokenType.IF)
        ? this.parsePrimary()
        : this.parseExpression();
    }

    return {
      type: 'IfExpression',
      condition,
      thenBranch,
      elseBranch,
      loc,
    };
  }

  private parseBlockExpression(): AST.BlockExpression {
    const loc = this.expect(TokenType.LBRACE).loc;
    const statements: AST.ASTNode[] = [];

    while (!this.match(TokenType.RBRACE) && !this.match(TokenType.EOF)) {
      statements.push(this.parseStatement());
    }

    this.expect(TokenType.RBRACE);

    return {
      type: 'BlockExpression',
      statements,
      loc,
    };
  }

  private parseLambda(): AST.Lambda {
    const loc = this.expect(TokenType.PIPE).loc; // consume '|'
    const params: string[] = [];

    if (!this.match(TokenType.PIPE)) {
      do {
        if (this.match(TokenType.COMMA)) {
          this.advance();
        }
        params.push(this.expect(TokenType.IDENTIFIER).value);
      } while (this.match(TokenType.COMMA));
    }

    this.expect(TokenType.PIPE);

    const body = this.match(TokenType.LBRACE)
      ? this.parseBlockExpression()
      : this.parseExpression();

    return {
      type: 'Lambda',
      params,
      body,
      loc,
    };
  }

  private parseArrayLiteral(): AST.ArrayLiteral {
    const loc = this.expect(TokenType.LBRACKET).loc;
    const elements: AST.ASTNode[] = [];

    if (!this.match(TokenType.RBRACKET)) {
      do {
        if (this.match(TokenType.COMMA)) {
          this.advance();
        }
        elements.push(this.parseExpression());
      } while (this.match(TokenType.COMMA));
    }

    this.expect(TokenType.RBRACKET);

    return {
      type: 'ArrayLiteral',
      elements,
      loc,
    };
  }
}
