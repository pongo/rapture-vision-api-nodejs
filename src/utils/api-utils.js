const reFetch = /^fetch/;

/** @type {import("./api-utils.d.ts").apiList} */
export function apiList(apis) {
  return Object.keys(apis).map((key) => [key.replace(reFetch, ""), apis[key]]);
}

/** @type {import("./api-utils.d.ts").startsWithHttp} */
export function startsWithHttp(str) {
  return str == null ? false : str.startsWith("http");
}
