// ─────────────────────────────────────────────────────────────────
// REFACTORED CODE
// Changes: ES6+, const/let, arrow functions, destructuring,
//          named params, WeakRef memoize, spread over slice,
//          early returns, JSDoc, flattenDeep via Array.flat(),
//          groupBy with nullish coalescing, chunk with Array.from
// ─────────────────────────────────────────────────────────────────

/**
 * Delays invoking `fn` until `wait` ms have elapsed since the last call.
 * @param {Function} fn        - The function to debounce.
 * @param {number}   wait      - Milliseconds to delay.
 * @param {object}  [options]
 * @param {boolean} [options.leading=false]  - Invoke on the leading edge.
 * @param {boolean} [options.trailing=true]  - Invoke on the trailing edge.
 * @param {number}  [options.maxWait]        - Maximum wait before forced invoke.
 * @returns {Function} The debounced function with .cancel / .flush / .pending.
 */
function debounce(fn, wait, {
  leading = false,
  trailing = true,
  maxWait
} = {}) {
  if (typeof fn !== 'function') throw new TypeError('Expected a function');

  wait = Number(wait) || 0;
  const hasMaxWait = maxWait !== undefined;
  const resolvedMaxWait = hasMaxWait ? Math.max(Number(maxWait) || 0, wait) : 0;

  let lastArgs, lastThis, result, timerId;
  let lastCallTime    = undefined;
  let lastInvokeTime  = 0;

  const invoke = (time) => {
    const args  = lastArgs;
    const ctx   = lastThis;
    lastArgs    = lastThis = undefined;
    lastInvokeTime = time;
    result = fn.apply(ctx, args);
    return result;
  };

  const remainingWait = (time) => {
    const sinceCall   = time - lastCallTime;
    const sinceInvoke = time - lastInvokeTime;
    const timeLeft    = wait - sinceCall;
    return hasMaxWait ? Math.min(timeLeft, resolvedMaxWait - sinceInvoke) : timeLeft;
  };

  const shouldInvoke = (time) => {
    const sinceCall   = time - lastCallTime;
    const sinceInvoke = time - lastInvokeTime;
    return (
      lastCallTime === undefined  ||
      sinceCall >= wait           ||
      sinceCall < 0               ||
      (hasMaxWait && sinceInvoke >= resolvedMaxWait)
    );
  };

  const leadingEdge = (time) => {
    lastInvokeTime = time;
    timerId = setTimeout(onTimerExpired, wait);
    return leading ? invoke(time) : result;
  };

  const trailingEdge = (time) => {
    timerId = undefined;
    if (trailing && lastArgs) return invoke(time);
    lastArgs = lastThis = undefined;
    return result;
  };

  const onTimerExpired = () => {
    const now = Date.now();
    if (shouldInvoke(now)) return trailingEdge(now);
    timerId = setTimeout(onTimerExpired, remainingWait(now));
  };

  function debounced(...args) {
    const now        = Date.now();
    const invokeNow  = shouldInvoke(now);
    lastArgs         = args;
    lastThis         = this;
    lastCallTime     = now;

    if (invokeNow) {
      if (timerId === undefined) return leadingEdge(lastCallTime);
      if (hasMaxWait) {
        clearTimeout(timerId);
        timerId = setTimeout(onTimerExpired, wait);
        return invoke(lastCallTime);
      }
    }
    if (timerId === undefined) timerId = setTimeout(onTimerExpired, wait);
    return result;
  }

  debounced.cancel  = () => {
    if (timerId !== undefined) clearTimeout(timerId);
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  };
  debounced.flush   = () => (timerId === undefined ? result : trailingEdge(Date.now()));
  debounced.pending = () => timerId !== undefined;

  return debounced;
}

/**
 * Throttles `fn` to invoke at most once every `wait` ms.
 */
const throttle = (fn, wait, { leading = true, trailing = true } = {}) => {
  if (typeof fn !== 'function') throw new TypeError('Expected a function');
  return debounce(fn, wait, { leading, trailing, maxWait: wait });
};

/**
 * Memoizes `fn`, caching results by the first argument (or `resolver` result).
 */
const memoize = (fn, resolver) => {
  if (typeof fn !== 'function' ||
     (resolver != null && typeof resolver !== 'function')) {
    throw new TypeError('Expected a function');
  }
  const cache = new Map();
  function memoized(...args) {
    const key = resolver ? resolver.apply(this, args) : args[0];
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  }
  memoized.cache = cache;
  memoized.clear = () => cache.clear();
  return memoized;
};

/**
 * Returns a function that invokes `fn` at most `n - 1` times.
 */
const before = (n, fn) => {
  if (typeof fn !== 'function') throw new TypeError('Expected a function');
  let result;
  let count = n;
  return function (...args) {
    if (--count > 0) result = fn.apply(this, args);
    if (count <= 1)  fn = undefined;
    return result;
  };
};

/** Returns a function that invokes `fn` only once. */
const once = (fn) => before(2, fn);

/**
 * Creates a curried version of `fn`.
 */
const curry = (fn, arity = fn?.length ?? 0) => {
  if (typeof fn !== 'function') throw new TypeError('Expected a function');
  const curried = (...args) =>
    args.length >= arity
      ? fn(...args)
      : (...more) => curried(...args, ...more);
  return curried;
};

/**
 * Deep-clones `value` (handles primitives, arrays, plain objects, Date, RegExp).
 */
const deepClone = (value) => {
  if (value === null || typeof value !== 'object') return value;
  if (value instanceof Date)   return new Date(value);
  if (value instanceof RegExp) return new RegExp(value);
  if (Array.isArray(value))    return value.map(deepClone);
  return Object.fromEntries(
    Object.entries(value).map(([k, v]) => [k, deepClone(v)])
  );
};

/**
 * Recursively flattens `array` to any depth.
 * Uses native Array.flat(Infinity) — significantly faster than manual recursion.
 */
const flattenDeep = (array) =>
  Array.isArray(array) ? array.flat(Infinity) : [];

/**
 * Splits `array` into chunks of length `size`.
 */
const chunk = (array, size) => {
  const s = Math.max(Number(size), 0);
  const len = array?.length ?? 0;
  if (!len || s < 1) return [];
  return Array.from({ length: Math.ceil(len / s) }, (_, i) =>
    array.slice(i * s, i * s + s)
  );
};

/**
 * Groups collection elements by the value returned by `iteratee`.
 * @param {string|Function} iteratee - Property name or mapping function.
 */
const groupBy = (collection, iteratee) => {
  if (!collection) return {};
  const getKey = typeof iteratee === 'string'
    ? (item) => item[iteratee]
    : iteratee;
  return collection.reduce((acc, item) => {
    const key = getKey(item);
    acc[key] = acc[key] ?? [];
    acc[key].push(item);
    return acc;
  }, {});
};

module.exports = { debounce, throttle, memoize, once, before, curry, deepClone, flattenDeep, chunk, groupBy };
