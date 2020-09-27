# flextest

A flexible test runner for JavaScript, highly inspired by [React Hooks](https://reactjs.org/docs/hooks-intro.html) for state management. Targeted at fundamental building parts of a test framework.

- tests are normal JavaScript files that can be run directly
- no built-in assertion library, but have pluggable support for assertions
- a modular design, which can be consumed by upper libraries
- a Hook-like syntax for declaring tranditional `before` and `after`

## Introduction

The library only introduces three functions, with which the all essential parts of a test library can be achieved.

### `test`

Use `test` to declare a test case.

```ts
test("a + b", () => {
  assert(1 + 2 === 3);
});
```

Test cases can be nested.

```ts
test("a + b", () => {
  assert(1 + 2 === 3);
  test("NaN", () => {
    assert(1 + NaN === NaN);
  });
  test("undefined", () => {
    assert(1 + undefined === undefined);
  });
});
```

### `hook`

Use hook to declare state to setup and teardown test environments. There are three main usages of `hook` function.

First, `hook` can be used as a simple setup function with return value.

```ts
const value = hook(() => {
  return 1;
});
// value === 1
```

As functions without returning value can be considered as returning `undefined`, `hook` in this way can also be used as a one-shot setup function.

Second, if a function returning another function is passed to `hook`, then the returned function will be considered as a teardown function.

```ts
hook(() => {
  console.log("setup");
  return () => {
    console.log("teardown");
  };
});
/*
 * This will output:
 * setup
 * teardown
 */
```

The setup part will run immediately, while teardown part will run after the surrounding test case finished.

Finally, the function may return `[value, teardown]` to combine the first part and the second part.

```ts
const value = hook(() => {
  console.log("setup");
  return [1, () => console.log("teardown")];
});
```

### `finish`

Waits for all async tests to complete, and generates report to the console. It can be directly called.

```ts
finish();
```

## License

The MIT License

    Copyright 2020 xfoxfu

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
