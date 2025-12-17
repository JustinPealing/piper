// Code Generator: AST to JavaScript

import * as AST from './ast.js';

const BUILTINS = ['print', 'len', 'map', 'filter', 'reduce', 'range', 'sum'];

export class CodeGenerator {
  private indentLevel: number = 0;
  private output: string[] = [];

  private indent(): string {
    return '  '.repeat(this.indentLevel);
  }

  private emit(code: string): void {
    this.output.push(code);
  }

  private emitLine(code: string): void {
    this.output.push(this.indent() + code + '\n');
  }

  public generate(ast: AST.Program): string {
    // Import runtime at the top
    this.emit('import * as __piper from "./runtime.js";\n\n');

    for (const node of ast.body) {
      this.generateNode(node);
    }

    return this.output.join('');
  }

  private generateNode(node: AST.ASTNode): void {
    switch (node.type) {
      case 'Program':
        throw new Error('Unexpected Program node in generateNode');

      case 'LetDeclaration':
        this.generateLetDeclaration(node);
        break;

      case 'VarDeclaration':
        this.generateVarDeclaration(node);
        break;

      case 'FunctionDeclaration':
        this.generateFunctionDeclaration(node);
        break;

      case 'Assignment':
        this.generateAssignment(node);
        break;

      case 'WhileStatement':
        this.generateWhileStatement(node);
        break;

      case 'ForStatement':
        this.generateForStatement(node);
        break;

      case 'ReturnStatement':
        this.generateReturnStatement(node);
        break;

      case 'ExpressionStatement':
        this.emitLine(this.generateExpression(node.expression) + ';');
        break;

      default:
        throw new Error(`Unknown statement type: ${(node as any).type}`);
    }
  }

  private generateLetDeclaration(node: AST.LetDeclaration): void {
    const init = this.generateExpression(node.init);
    this.emitLine(`const ${node.name} = ${init};`);
  }

  private generateVarDeclaration(node: AST.VarDeclaration): void {
    const init = this.generateExpression(node.init);
    this.emitLine(`let ${node.name} = ${init};`);
  }

  private generateFunctionDeclaration(node: AST.FunctionDeclaration): void {
    const params = node.params.join(', ');

    if (node.isExpression) {
      const body = this.generateExpression(node.body);
      this.emitLine(`function ${node.name}(${params}) {`);
      this.indentLevel++;
      this.emitLine(`return ${body};`);
      this.indentLevel--;
      this.emitLine('}');
    } else {
      this.emitLine(`function ${node.name}(${params}) {`);
      this.indentLevel++;
      this.generateBlockBody(node.body as AST.BlockExpression);
      this.indentLevel--;
      this.emitLine('}');
    }
  }

  private generateAssignment(node: AST.Assignment): void {
    const value = this.generateExpression(node.value);
    this.emitLine(`${node.name} = ${value};`);
  }

  private generateWhileStatement(node: AST.WhileStatement): void {
    const condition = this.generateExpression(node.condition);
    this.emitLine(`while (${condition}) {`);
    this.indentLevel++;
    const body = node.body as AST.BlockExpression;
    this.generateStatements(body.statements);
    this.indentLevel--;
    this.emitLine('}');
  }

  private generateForStatement(node: AST.ForStatement): void {
    const iterable = this.generateExpression(node.iterable);
    this.emitLine(`for (const ${node.variable} of ${iterable}) {`);
    this.indentLevel++;
    const body = node.body as AST.BlockExpression;
    this.generateStatements(body.statements);
    this.indentLevel--;
    this.emitLine('}');
  }

  private generateReturnStatement(node: AST.ReturnStatement): void {
    if (node.value) {
      const value = this.generateExpression(node.value);
      this.emitLine(`return ${value};`);
    } else {
      this.emitLine('return;');
    }
  }

  private generateExpression(node: AST.ASTNode): string {
    switch (node.type) {
      case 'BinaryExpression':
        return this.generateBinaryExpression(node);

      case 'UnaryExpression':
        return this.generateUnaryExpression(node);

      case 'PipeExpression':
        return this.generatePipeExpression(node);

      case 'CallExpression':
        return this.generateCallExpression(node);

      case 'Lambda':
        return this.generateLambda(node);

      case 'Identifier':
        return node.name;

      case 'Literal':
        return this.generateLiteral(node);

      case 'ArrayLiteral':
        return this.generateArrayLiteral(node);

      case 'IfExpression':
        return this.generateIfExpression(node);

      case 'BlockExpression':
        return this.generateBlockExpression(node);

      default:
        throw new Error(`Unknown expression type: ${(node as any).type}`);
    }
  }

  private generateBinaryExpression(node: AST.BinaryExpression): string {
    const left = this.generateExpression(node.left);
    const right = this.generateExpression(node.right);

    // Map operators
    const op = node.operator === '==' ? '===' : node.operator === '!=' ? '!==' : node.operator;

    return `(${left} ${op} ${right})`;
  }

  private generateUnaryExpression(node: AST.UnaryExpression): string {
    const operand = this.generateExpression(node.operand);
    return `(${node.operator}${operand})`;
  }

  private generatePipeExpression(node: AST.PipeExpression): string {
    const left = this.generateExpression(node.left);

    // Right side can be an identifier or a call expression
    if (node.right.type === 'Identifier') {
      // x |> f  →  f(x)
      const name = node.right.name;
      const fnName = BUILTINS.includes(name) ? `__piper.${name}` : name;
      return `${fnName}(${left})`;
    } else if (node.right.type === 'CallExpression') {
      // x |> f(y, z)  →  f(x, y, z)
      const call = node.right as AST.CallExpression;
      const args = [left, ...call.args.map(arg => this.generateExpression(arg))];

      // Check if the callee is a built-in
      if (call.callee.type === 'Identifier') {
        const name = (call.callee as AST.Identifier).name;
        const fnName = BUILTINS.includes(name) ? `__piper.${name}` : name;
        return `${fnName}(${args.join(', ')})`;
      }

      const callee = this.generateExpression(call.callee);
      return `${callee}(${args.join(', ')})`;
    } else {
      throw new Error(`Invalid pipe target: ${node.right.type}`);
    }
  }

  private generateCallExpression(node: AST.CallExpression): string {
    const callee = this.generateExpression(node.callee);
    const args = node.args.map(arg => this.generateExpression(arg));

    // Map built-in functions to runtime
    if (node.callee.type === 'Identifier') {
      const name = (node.callee as AST.Identifier).name;
      if (BUILTINS.includes(name)) {
        return `__piper.${name}(${args.join(', ')})`;
      }
    }

    return `${callee}(${args.join(', ')})`;
  }

  private generateLambda(node: AST.Lambda): string {
    const params = node.params.join(', ');

    if (node.body.type === 'BlockExpression') {
      const block = node.body as AST.BlockExpression;
      let body = '{\n';
      this.indentLevel++;
      const savedOutput = this.output;
      this.output = [];
      this.generateBlockBody(block);
      body += this.output.join('');
      this.output = savedOutput;
      this.indentLevel--;
      body += this.indent() + '}';
      return `((${params}) => ${body})`;
    } else {
      const body = this.generateExpression(node.body);
      return `((${params}) => ${body})`;
    }
  }

  private generateLiteral(node: AST.Literal): string {
    if (typeof node.value === 'string') {
      return JSON.stringify(node.value);
    }
    if (node.value === null) {
      return 'null';
    }
    return String(node.value);
  }

  private generateArrayLiteral(node: AST.ArrayLiteral): string {
    const elements = node.elements.map(el => this.generateExpression(el));
    return `[${elements.join(', ')}]`;
  }

  private generateIfExpression(node: AST.IfExpression): string {
    const condition = this.generateExpression(node.condition);
    const thenBranch = this.generateExpression(node.thenBranch);

    if (node.elseBranch) {
      const elseBranch = this.generateExpression(node.elseBranch);
      return `(${condition} ? ${thenBranch} : ${elseBranch})`;
    } else {
      return `(${condition} ? ${thenBranch} : undefined)`;
    }
  }

  private generateBlockExpression(node: AST.BlockExpression): string {
    // IIFE for block expressions
    let body = '(() => {\n';
    this.indentLevel++;

    const savedOutput = this.output;
    this.output = [];

    this.generateBlockBody(node);

    body += this.output.join('');
    this.output = savedOutput;

    this.indentLevel--;
    body += this.indent() + '})()';

    return body;
  }

  private generateStatements(statements: AST.ASTNode[]): void {
    for (const stmt of statements) {
      this.generateNode(stmt);
    }
  }

  private generateBlockBody(node: AST.BlockExpression): void {
    const statements = node.statements;

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      const isLast = i === statements.length - 1;

      // Last statement in a block is implicitly returned (if it's an expression)
      if (isLast && stmt.type === 'ExpressionStatement') {
        const expr = (stmt as AST.ExpressionStatement).expression;
        this.emitLine(`return ${this.generateExpression(expr)};`);
      } else {
        this.generateNode(stmt);
      }
    }

    // Empty block returns undefined
    if (statements.length === 0) {
      this.emitLine('return undefined;');
    }
  }
}
