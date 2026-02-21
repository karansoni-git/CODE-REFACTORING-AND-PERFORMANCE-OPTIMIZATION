# CODE-REFACTORING-AND-PERFORMANCE-OPTIMIZATION

### COMPANY: CODTECH IT SOLUTIONS
### NAME: KARAN PAREKH
### INTERN ID: CTIS1913
### DOMAIN: SOFTWARE DEVELOPMENT
### DURATION: 6 WEEEKS
### MENTOR: MUZAMMIL AHMED

DESCRIPTION : 

This project takes a real-world open-source JavaScript utility library — modelled after the foundational patterns of lodash — and systematically refactors it for improved readability, performance, and correctness. The library implements ten core functions used across virtually every JavaScript codebase: `debounce`, `throttle`, `memoize`, `once`, `before`, `curry`, `deepClone`, `flattenDeep`, `chunk`, and `groupBy`.

---

## What Was Refactored

The original code was written in ES5 style, typical of open-source libraries from the 2014–2017 era: `var` declarations, `arguments` objects, `Array.prototype.slice.call()` idioms, and string-keyed option access. While functionally correct in most cases, this style carries hidden costs — verbose syntax, poor stack traces, missed engine optimisations, and subtle bugs that only surface with uncommon input types.

The refactored version modernises every function to idiomatic ES2020+, replacing legacy patterns with `const`/`let`, destructured parameters with defaults, rest/spread operators, arrow functions, and native array methods like `Array.flat()`.

---

## Performance Results

Benchmarks were run with 5-run averaging at up to 1,000,000 iterations per function using Node.js's `process.hrtime.bigint()` for nanosecond precision. The results are clear:

- **curry** improved by **63%** — replacing `Array.prototype.slice.call(arguments)` with rest params eliminates intermediate array allocation on every call.
- **flattenDeep** improved by **32%** — delegating to the native C++ `Array.flat(Infinity)` outperforms recursive JavaScript loops.
- **memoize** and **once** saw minor improvements from simplified lookup paths.

Three functions (`chunk`, `groupBy`, `deepClone`) trade micro-benchmark speed for readability and correctness — a deliberate, documented decision. At realistic call volumes the differences are sub-millisecond and imperceptible.

---

## Bug Fixes & New Features

The most impactful change was a silent correctness bug in `deepClone`: the original silently converted `Date` and `RegExp` objects into empty plain objects (`{}`), corrupting any cloned data containing those types. The refactored version handles both correctly. Additionally, `memoize` now exposes a `.clear()` method for explicit cache invalidation, preventing potential memory leaks in long-running applications.

---

## Code Quality

Beyond performance, the refactor reduced total code lines by **17.6%** while increasing documentation coverage by **300%** — adding JSDoc to all ten public functions. The result is a leaner, self-documenting codebase with zero `var` declarations, zero raw `arguments` usage, and full IDE autocompletion support.

> A full benchmark report, side-by-side code comparisons, and change impact analysis are included in the accompanying `.docx` report.
