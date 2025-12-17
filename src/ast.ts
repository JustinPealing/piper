// AST Node Types for Piper Language

export interface SourceLocation {
  line: number;
  column: number;
}

export type ASTNode =
  | Program
  | LetDeclaration
  | VarDeclaration
  | FunctionDeclaration
  | Assignment
  | IfExpression
  | WhileStatement
  | ForStatement
  | BlockExpression
  | BinaryExpression
  | UnaryExpression
  | PipeExpression
  | CallExpression
  | Lambda
  | Identifier
  | Literal
  | ArrayLiteral
  | ExpressionStatement
  | ReturnStatement;

export interface BaseNode {
  type: string;
  loc?: SourceLocation;
}

export interface Program extends BaseNode {
  type: 'Program';
  body: ASTNode[];
}

export interface LetDeclaration extends BaseNode {
  type: 'LetDeclaration';
  name: string;
  init: ASTNode;
}

export interface VarDeclaration extends BaseNode {
  type: 'VarDeclaration';
  name: string;
  init: ASTNode;
}

export interface FunctionDeclaration extends BaseNode {
  type: 'FunctionDeclaration';
  name: string;
  params: string[];
  body: ASTNode; // BlockExpression or single expression
  isExpression: boolean; // true for `fn f(x) = x * 2`
}

export interface Assignment extends BaseNode {
  type: 'Assignment';
  name: string;
  value: ASTNode;
}

export interface IfExpression extends BaseNode {
  type: 'IfExpression';
  condition: ASTNode;
  thenBranch: ASTNode;
  elseBranch?: ASTNode;
}

export interface WhileStatement extends BaseNode {
  type: 'WhileStatement';
  condition: ASTNode;
  body: ASTNode;
}

export interface ForStatement extends BaseNode {
  type: 'ForStatement';
  variable: string;
  iterable: ASTNode;
  body: ASTNode;
}

export interface BlockExpression extends BaseNode {
  type: 'BlockExpression';
  statements: ASTNode[];
}

export interface BinaryExpression extends BaseNode {
  type: 'BinaryExpression';
  operator: string;
  left: ASTNode;
  right: ASTNode;
}

export interface UnaryExpression extends BaseNode {
  type: 'UnaryExpression';
  operator: string;
  operand: ASTNode;
}

export interface PipeExpression extends BaseNode {
  type: 'PipeExpression';
  left: ASTNode;
  right: ASTNode; // CallExpression or Identifier
}

export interface CallExpression extends BaseNode {
  type: 'CallExpression';
  callee: ASTNode;
  args: ASTNode[];
}

export interface Lambda extends BaseNode {
  type: 'Lambda';
  params: string[];
  body: ASTNode;
}

export interface Identifier extends BaseNode {
  type: 'Identifier';
  name: string;
}

export interface Literal extends BaseNode {
  type: 'Literal';
  value: number | string | boolean | null;
  raw: string;
}

export interface ArrayLiteral extends BaseNode {
  type: 'ArrayLiteral';
  elements: ASTNode[];
}

export interface ExpressionStatement extends BaseNode {
  type: 'ExpressionStatement';
  expression: ASTNode;
}

export interface ReturnStatement extends BaseNode {
  type: 'ReturnStatement';
  value?: ASTNode;
}
