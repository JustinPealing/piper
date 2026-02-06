// Error handling for Piper Language

// Uses string values directly to avoid circular dependency with lexer.ts
// These must match the TokenType enum values in lexer.ts
export const TOKEN_DISPLAY_NAMES: Record<string, string> = {
  NUMBER: 'number',
  STRING: 'string',
  TRUE: "'true'",
  FALSE: "'false'",
  NULL: "'null'",
  IDENTIFIER: 'identifier',
  LET: "'let'",
  VAR: "'var'",
  FN: "'fn'",
  IF: "'if'",
  THEN: "'then'",
  ELSE: "'else'",
  WHILE: "'while'",
  FOR: "'for'",
  IN: "'in'",
  RETURN: "'return'",
  PLUS: "'+'",
  MINUS: "'-'",
  STAR: "'*'",
  SLASH: "'/'",
  PERCENT: "'%'",
  EQ: "'='",
  EQEQ: "'=='",
  NEQ: "'!='",
  LT: "'<'",
  LTE: "'<='",
  GT: "'>'",
  GTE: "'>='",
  AND: "'&&'",
  OR: "'||'",
  NOT: "'!'",
  PIPE: "'|>'",
  LPAREN: "'('",
  RPAREN: "')'",
  LBRACE: "'{'",
  RBRACE: "'}'",
  LBRACKET: "'['",
  RBRACKET: "']'",
  COMMA: "','",
  SEMICOLON: "';'",
  ARROW: "'->'",
  EOF: 'end of file',
  NEWLINE: 'newline',
};

export class PiperError extends Error {
  public source: string;
  public filePath?: string;
  public line: number;
  public column: number;

  constructor(message: string, source: string, line: number, column: number) {
    super(message);
    this.name = 'PiperError';
    this.source = source;
    this.line = line;
    this.column = column;
  }
}

export function formatError(error: PiperError): string {
  const lines: string[] = [];

  lines.push(`error: ${error.message}`);
  lines.push('');

  const location = error.filePath || '<input>';
  lines.push(`  --> ${location}:${error.line}:${error.column}`);

  const sourceLines = error.source.split('\n');
  const sourceLine = sourceLines[error.line - 1];

  if (sourceLine !== undefined) {
    const lineNumStr = String(error.line);
    const gutter = ' '.repeat(lineNumStr.length);

    lines.push(`${gutter} |`);
    lines.push(`${lineNumStr} | ${sourceLine}`);
    lines.push(`${gutter} | ${' '.repeat(error.column - 1)}^ ${error.message}`);
  }

  return lines.join('\n');
}
