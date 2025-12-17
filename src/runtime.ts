// Runtime built-in functions for Piper

export function print(...args: any[]): void {
  console.log(...args);
}

export function len(x: any): number {
  if (Array.isArray(x) || typeof x === 'string') {
    return x.length;
  }
  throw new Error(`len() expects array or string, got ${typeof x}`);
}

export function map<T, U>(arr: T[], fn: (item: T, index: number) => U): U[] {
  if (!Array.isArray(arr)) {
    throw new Error(`map() expects array as first argument, got ${typeof arr}`);
  }
  return arr.map(fn);
}

export function filter<T>(arr: T[], fn: (item: T, index: number) => boolean): T[] {
  if (!Array.isArray(arr)) {
    throw new Error(`filter() expects array as first argument, got ${typeof arr}`);
  }
  return arr.filter(fn);
}

export function reduce<T, U>(arr: T[], fn: (acc: U, item: T, index: number) => U, init: U): U {
  if (!Array.isArray(arr)) {
    throw new Error(`reduce() expects array as first argument, got ${typeof arr}`);
  }
  return arr.reduce(fn, init);
}

export function range(start: number, end: number): number[] {
  if (typeof start !== 'number' || typeof end !== 'number') {
    throw new Error(`range() expects two numbers, got ${typeof start} and ${typeof end}`);
  }
  const result: number[] = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
}

export function sum(arr: number[]): number {
  if (!Array.isArray(arr)) {
    throw new Error(`sum() expects array, got ${typeof arr}`);
  }
  return arr.reduce((acc, x) => acc + x, 0);
}
