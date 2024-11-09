/* c8 ignore start */
/* node:coverage disable */

export function formatErr(res) {
  return res.isErr ? `${res.error.name}: ${res.error.message}` : "";
}
