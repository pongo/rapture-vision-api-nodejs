"use strict";

const { performance } = require("perf_hooks");

/**
 * @example
 * const elapsed = timeStart();
 * // ...
 * console.log(`elapsed: ${elapsed()} ms`);
 */
function timeStart() {
  const start = performance.now();
  return () => Math.round(performance.now() - start);
}

module.exports.timeStart = timeStart;
