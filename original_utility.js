// ─────────────────────────────────────────────────────────────────
// ORIGINAL CODE  (based on common open-source utility patterns,
// similar to early versions of lodash debounce/throttle/memoize)
// ─────────────────────────────────────────────────────────────────

// debounce: delays invoking func until after wait ms have elapsed
function debounce(func, wait, options) {
  var lastArgs, lastThis, result, lastCallTime;
  var lastInvokeTime = 0;
  var leading = false;
  var maxing = false;
  var trailing = true;
  var timerId;
  var maxWait;

  if (typeof func != 'function') {
    throw new TypeError('Expected a function');
  }
  wait = +wait || 0;
  if (typeof options === 'object' && options !== null) {
    leading = !!options['leading'];
    maxing = 'maxWait' in options;
    maxWait = maxing ? Math.max(+options['maxWait'] || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options['trailing'] : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs;
    var thisArg = lastThis;
    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    lastInvokeTime = time;
    timerId = setTimeout(timerExpired, wait);
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime;
    var timeSinceLastInvoke = time - lastInvokeTime;
    var timeWaiting = wait - timeSinceLastCall;
    return maxing ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime;
    var timeSinceLastInvoke = time - lastInvokeTime;
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) { clearTimeout(timerId); }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(Date.now());
  }

  function pending() {
    return timerId !== undefined;
  }

  function debounced() {
    var time = Date.now();
    var isInvoking = shouldInvoke(time);
    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;
    if (isInvoking) {
      if (timerId === undefined) { return leadingEdge(lastCallTime); }
      if (maxing) {
        clearTimeout(timerId);
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) { timerId = setTimeout(timerExpired, wait); }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  debounced.pending = pending;
  return debounced;
}

// throttle: invokes func at most once per wait ms
function throttle(func, wait, options) {
  var leading = true;
  var trailing = true;
  if (typeof func != 'function') {
    throw new TypeError('Expected a function');
  }
  if (typeof options === 'object' && options !== null) {
    leading = 'leading' in options ? !!options['leading'] : leading;
    trailing = 'trailing' in options ? !!options['trailing'] : trailing;
  }
  return debounce(func, wait, {
    'leading': leading,
    'trailing': trailing,
    'maxWait': wait
  });
}

// memoize: caches results of func
function memoize(func, resolver) {
  if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
    throw new TypeError('Expected a function');
  }
  var memoized = function() {
    var args = arguments;
    var key = resolver ? resolver.apply(this, args) : args[0];
    var cache = memoized.cache;
    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize.Cache || Map);
  return memoized;
}
memoize.Cache = Map;

// once: func invoked only once
function once(func) {
  return before(2, func);
}

function before(n, func) {
  var result;
  if (typeof func != 'function') {
    throw new TypeError('Expected a function');
  }
  return function() {
    if (--n > 0) {
      result = func.apply(this, arguments);
    }
    if (n <= 1) {
      func = undefined;
    }
    return result;
  };
}

// curry: creates a curried version of func
function curry(func, arity) {
  arity = arity == null ? (func ? func.length : 0) : +arity;
  if (typeof func != 'function') {
    throw new TypeError('Expected a function');
  }
  function curried() {
    var args = Array.prototype.slice.call(arguments);
    if (args.length >= arity) {
      return func.apply(this, args);
    }
    return function() {
      var moreArgs = Array.prototype.slice.call(arguments);
      return curried.apply(this, args.concat(moreArgs));
    };
  }
  return curried;
}

// deepClone: deep clones an object
function deepClone(value) {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    var arr = [];
    for (var i = 0; i < value.length; i++) {
      arr[i] = deepClone(value[i]);
    }
    return arr;
  }
  var obj = {};
  var keys = Object.keys(value);
  for (var i = 0; i < keys.length; i++) {
    obj[keys[i]] = deepClone(value[keys[i]]);
  }
  return obj;
}

// flattenDeep: recursively flattens nested arrays
function flattenDeep(array) {
  var result = [];
  if (!Array.isArray(array)) {
    return result;
  }
  for (var i = 0; i < array.length; i++) {
    if (Array.isArray(array[i])) {
      var flattened = flattenDeep(array[i]);
      for (var j = 0; j < flattened.length; j++) {
        result.push(flattened[j]);
      }
    } else {
      result.push(array[i]);
    }
  }
  return result;
}

// chunk: splits array into chunks of given size
function chunk(array, size) {
  size = Math.max(+size, 0);
  var length = array == null ? 0 : array.length;
  if (!length || size < 1) { return []; }
  var index = 0;
  var resIndex = 0;
  var result = new Array(Math.ceil(length / size));
  while (index < length) {
    result[resIndex++] = array.slice(index, (index += size));
  }
  return result;
}

// groupBy: groups collection elements by iteratee result
function groupBy(collection, iteratee) {
  var result = {};
  if (collection == null) return result;
  var i;
  if (typeof iteratee === 'string') {
    var prop = iteratee;
    iteratee = function(item) { return item[prop]; };
  }
  for (i = 0; i < collection.length; i++) {
    var key = iteratee(collection[i]);
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      result[key].push(collection[i]);
    } else {
      result[key] = [collection[i]];
    }
  }
  return result;
}

module.exports = { debounce, throttle, memoize, once, before, curry, deepClone, flattenDeep, chunk, groupBy };
