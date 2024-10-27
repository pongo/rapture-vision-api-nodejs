import { performance } from "node:perf_hooks";

/**
 * @example
 * const elapsed = timeStart();
 * // ...
 * console.log(`elapsed: ${elapsed()} ms`);
 */
export function timeStart() {
  const start = performance.now();
  return () => Math.round(performance.now() - start);
}
