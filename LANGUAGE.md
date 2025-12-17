# Piper Language Reference

Piper is a pipe-first programming language that transpiles to JavaScript. It features a clean syntax with first-class functions, lambdas, and a powerful pipe operator for data transformation.

## Table of Contents

- [Variables](#variables)
- [Functions](#functions)
- [Lambdas](#lambdas)
- [Pipe Operator](#pipe-operator)
- [Control Flow](#control-flow)
- [Data Types](#data-types)
- [Built-in Functions](#built-in-functions)
- [Comments](#comments)

## Variables

### Immutable Variables (let)

```piper
let x = 42
let name = "Alice"
let items = [1, 2, 3]
```

Variables declared with `let` cannot be reassigned.

### Mutable Variables (var)

```piper
var counter = 0
counter = counter + 1
counter = 10
```

Variables declared with `var` can be reassigned.

## Functions

### Expression-Style Functions

For simple single-expression functions, use the concise syntax:

```piper
fn double(x) = x * 2
fn add(a, b) = a + b
fn square(x) = x * x
```

The last expression is automatically returned.

### Block-Style Functions

For multi-statement functions, use block syntax:

```piper
fn greet(name) {
  let message = "Hello, " + name + "!"
  message
}

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

The last expression in a block is implicitly returned.

## Lambdas

Lambdas (anonymous functions) use the `|param| body` syntax:

```piper
let double = |x| x * 2
let add = |x, y| x + y
```

Multi-statement lambdas use blocks:

```piper
let complex = |x| {
  let y = x * 2
  let z = y + 1
  z
}
```

Lambdas are commonly used with higher-order functions:

```piper
map([1, 2, 3], |x| x * 2)
filter([1, 2, 3, 4], |x| x % 2 == 0)
```

## Pipe Operator

The pipe operator `|>` is Piper's key feature. It inserts the left operand as the **first argument** to the right side.

### Basic Piping

```piper
x |> f           // Becomes: f(x)
x |> f(y, z)     // Becomes: f(x, y, z)
```

### Chaining Pipes

```piper
[1, 2, 3, 4, 5]
  |> filter(|x| x % 2 == 0)
  |> map(|x| x * 2)
  |> sum
// Result: 12 (2*2 + 4*2)
```

### Function Composition

```piper
fn double(x) = x * 2
fn increment(x) = x + 1

let result = 5 |> double |> increment
// result = 11
```

## Control Flow

### If Expressions

`if` is an expression that returns a value:

```piper
let max = if a > b then a else b

let sign = if x < 0 then -1 else if x > 0 then 1 else 0
```

With blocks:

```piper
let result = if condition {
  doSomething()
  computeValue()
} else {
  computeOtherValue()
}
```

The `then` keyword is optional when using blocks.

### While Loops

```piper
var i = 0
while i < 10 {
  print(i)
  i = i + 1
}
```

### For Loops

Iterate over arrays or ranges:

```piper
for item in [1, 2, 3, 4, 5] {
  print(item)
}

for i in range(0, 10) {
  print(i * i)
}
```

### Block Expressions

Blocks can be used as expressions:

```piper
let result = {
  let a = compute()
  let b = other()
  a + b  // This value is returned
}
```

## Data Types

### Numbers

```piper
let integer = 42
let float = 3.14
let negative = -17
```

### Strings

```piper
let greeting = "Hello"
let name = 'Alice'
let escaped = "Line 1\nLine 2"
```

Supported escape sequences: `\n`, `\t`, `\r`, `\\`, `\"`, `\'`

### Booleans

```piper
let yes = true
let no = false
```

### Null

```piper
let nothing = null
```

### Arrays

```piper
let numbers = [1, 2, 3, 4, 5]
let mixed = [1, "two", 3.0, true]
let nested = [[1, 2], [3, 4]]
```

## Built-in Functions

### print(...args)

Output values to the console:

```piper
print("Hello, World!")
print("x =", x, "y =", y)
```

### len(x)

Get the length of an array or string:

```piper
len([1, 2, 3])     // 3
len("hello")       // 5
```

### map(array, fn)

Transform each element:

```piper
map([1, 2, 3], |x| x * 2)
// [2, 4, 6]

[1, 2, 3] |> map(|x| x * 2)
// Using pipe operator
```

### filter(array, fn)

Keep elements that match predicate:

```piper
filter([1, 2, 3, 4], |x| x % 2 == 0)
// [2, 4]

[1, 2, 3, 4] |> filter(|x| x % 2 == 0)
// Using pipe operator
```

### reduce(array, fn, init)

Reduce array to single value:

```piper
reduce([1, 2, 3, 4], |acc, x| acc + x, 0)
// 10

[1, 2, 3, 4] |> reduce(|acc, x| acc * x, 1)
// 24
```

### range(start, end)

Generate array of numbers from start (inclusive) to end (exclusive):

```piper
range(0, 5)        // [0, 1, 2, 3, 4]
range(1, 11)       // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
```

### sum(array)

Sum all elements in an array:

```piper
sum([1, 2, 3, 4, 5])   // 15
```

## Operators

### Arithmetic

- `+` Addition
- `-` Subtraction
- `*` Multiplication
- `/` Division
- `%` Modulo
- `-x` Unary negation

### Comparison

- `==` Equal to (uses strict equality in JS)
- `!=` Not equal to (uses strict inequality in JS)
- `<` Less than
- `<=` Less than or equal
- `>` Greater than
- `>=` Greater than or equal

### Logical

- `&&` Logical AND
- `||` Logical OR
- `!` Logical NOT

### Pipe

- `|>` Pipe operator (left becomes first arg of right)

## Comments

```piper
// Single-line comment

let x = 42  // Comment after code
```

## Operator Precedence

From highest to lowest:

1. Primary (literals, identifiers, parentheses)
2. Function calls
3. Unary (`-`, `!`)
4. Multiplicative (`*`, `/`, `%`)
5. Additive (`+`, `-`)
6. Comparison (`<`, `<=`, `>`, `>=`)
7. Equality (`==`, `!=`)
8. Logical AND (`&&`)
9. Logical OR (`||`)
10. Pipe (`|>`)

## Examples

### Data Processing Pipeline

```piper
range(1, 101)
  |> filter(|x| x % 3 == 0 || x % 5 == 0)
  |> map(|x| x * x)
  |> sum
  |> print
```

### Fibonacci Sequence

```piper
fn fib(n) = if n <= 1 then n else fib(n - 1) + fib(n - 2)

for i in range(0, 10) {
  print("fib(" + i + ") =", fib(i))
}
```

### Higher-Order Functions

```piper
fn makeAdder(x) = |y| x + y

let add5 = makeAdder(5)
let add10 = makeAdder(10)

print(add5(3))   // 8
print(add10(3))  // 13
```
