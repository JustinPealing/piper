# Piper Programming Language

A pipe-first programming language that transpiles to JavaScript. Designed for clean, functional-style data transformations with a powerful pipe operator.

## Quick Start

### Installation

```bash
cd piper
npm install
npm run build
```

### Running Programs

```bash
# Run a Piper program
npm run piper run examples/hello.piper

# Compile to JavaScript
npm run piper build examples/hello.piper

# Run tests
npm test
```

## Example

```piper
// Data transformation pipeline
range(1, 11)
  |> filter(|x| x % 2 == 0)
  |> map(|x| x * 2)
  |> sum
  |> print

// Output: 60
```

## Key Features

### Pipe Operator

The `|>` operator inserts the left value as the **first argument** to the right function:

```piper
5 |> double              // double(5)
5 |> add(3)              // add(5, 3)
[1,2,3] |> map(|x| x*2)  // map([1,2,3], |x| x*2)
```

### Clean Function Syntax

```piper
// Expression style
fn double(x) = x * 2

// Block style
fn factorial(n) {
  var result = 1
  var i = 1
  while i <= n {
    result = result * i
    i = i + 1
  }
  result
}
```

### First-Class Lambdas

```piper
let double = |x| x * 2
let add = |x, y| x + y

[1, 2, 3] |> map(|x| x * 2) |> filter(|x| x > 2)
```

## Documentation

See [LANGUAGE.md](./LANGUAGE.md) for complete language reference.

## For Claude Code Sessions

When working with Piper in a fresh Claude Code session, you need to know:

### Project Structure

```
piper/
├── src/              # TypeScript source
│   ├── lexer.ts      # Tokenizer
│   ├── parser.ts     # Parser (recursive descent)
│   ├── ast.ts        # AST types
│   ├── codegen.ts    # JavaScript code generator
│   ├── runtime.ts    # Built-in functions
│   └── cli.ts        # Command-line interface
├── examples/         # Example .piper programs
├── tests/            # Unit and integration tests
├── LANGUAGE.md       # Complete language reference
└── README.md         # This file
```

### Development Workflow

1. **Build the compiler:**
   ```bash
   npm run build
   ```

2. **Write Piper code:** Create `.piper` files in the examples directory

3. **Test your code:**
   ```bash
   npm run piper run examples/yourfile.piper
   ```

4. **Iterate on errors:** The compiler provides line/column information for errors

5. **Run tests:**
   ```bash
   npm test
   ```

### Common Compiler Errors

The compiler will report errors with line and column numbers:

```
Error: Expected RPAREN but got IDENTIFIER at line 5, column 12
Error: Unexpected token ELSE at line 10, column 3
```

### Debugging Generated Code

To see the JavaScript output:

```bash
npm run piper build examples/yourfile.piper
cat examples/yourfile.js
```

### Built-in Functions

Available without import:
- `print(...args)` - console output
- `len(x)` - array/string length
- `map(arr, fn)` - transform array
- `filter(arr, fn)` - filter array
- `reduce(arr, fn, init)` - reduce array
- `range(start, end)` - generate number array
- `sum(arr)` - sum array elements

All built-ins work with the pipe operator:

```piper
[1, 2, 3] |> map(|x| x * 2) |> sum
```

### Language Features

#### Variables
- `let x = value` - immutable
- `var x = value` - mutable

#### Functions
- `fn name(params) = expr` - expression style
- `fn name(params) { body }` - block style

#### Control Flow
- `if cond then expr else expr` - expression
- `if cond { block } else { block }` - block form
- `while cond { body }` - loop
- `for x in arr { body }` - iteration

#### Data Types
- Numbers: `42`, `3.14`
- Strings: `"hello"`, `'world'`
- Booleans: `true`, `false`
- Null: `null`
- Arrays: `[1, 2, 3]`

#### Operators
- Arithmetic: `+`, `-`, `*`, `/`, `%`
- Comparison: `==`, `!=`, `<`, `<=`, `>`, `>=`
- Logical: `&&`, `||`, `!`
- Pipe: `|>`

### Writing Tests

Tests use Node's built-in test runner:

```javascript
import { test } from 'node:test';
import assert from 'node:assert';

test('description', () => {
  // Test code
  assert.strictEqual(actual, expected);
});
```

### Extending the Language

To add a new feature:

1. **Add tokens** (if needed) in `lexer.ts`
2. **Add AST node types** in `ast.ts`
3. **Add parsing logic** in `parser.ts`
4. **Add code generation** in `codegen.ts`
5. **Write tests** in `tests/`
6. **Update documentation** in `LANGUAGE.md`

### Tips for Claude Code

1. **Always build before running:** `npm run build && npm run piper run file.piper`
2. **Use tests to verify:** Write test programs and run them to verify behavior
3. **Check generated JS:** When debugging, look at the generated JavaScript
4. **Error messages are helpful:** Compiler errors include line and column numbers
5. **Examples are your friend:** Look at `examples/` for working code patterns
6. **Pipe operator is powerful:** Most data transformations should use `|>`

### Example Development Session

```bash
# 1. Build the compiler
npm run build

# 2. Create a test program
cat > examples/test.piper << 'EOF'
fn fizzbuzz(n) {
  for i in range(1, n + 1) {
    let output = if i % 15 == 0 then "FizzBuzz"
                 else if i % 3 == 0 then "Fizz"
                 else if i % 5 == 0 then "Buzz"
                 else i
    print(output)
  }
}

fizzbuzz(15)
EOF

# 3. Run it
npm run piper run examples/test.piper

# 4. If there are errors, fix them and rebuild
npm run build
npm run piper run examples/test.piper
```

## Architecture

Piper uses a classic compiler pipeline:

1. **Lexer** (`lexer.ts`): Source code → Tokens
2. **Parser** (`parser.ts`): Tokens → AST (recursive descent)
3. **Code Generator** (`codegen.ts`): AST → JavaScript
4. **Runtime** (`runtime.ts`): Built-in functions
5. **CLI** (`cli.ts`): Command-line interface

The transpiled JavaScript is executed with Node.js.

## Testing Strategy

- **Unit tests**: Test each compiler phase independently
- **Integration tests**: Compile and evaluate complete programs
- **Example programs**: Real-world usage patterns

Run all tests: `npm test`

## Future Extensions

The language is designed to be extensible. Potential additions:

- Type annotations and inference
- Pattern matching
- Structs/records
- Module system
- String interpolation
- Destructuring
- Spread operator
- Async/await

Keep the implementation simple and focused on core features first.

## License

MIT
