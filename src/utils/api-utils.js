"use strict";

const reFetch = /^fetch/;

/** @type {import("./api-utils.d.ts").apiList} */
function apiList(apis) {
  return Object.keys(apis).map((key) => [key.replace(reFetch, ""), apis[key]]);
}

/** @type {import("./api-utils.d.ts").startsWithHttp} */
function startsWithHttp(str) {
  return str == null ? false : str.startsWith("http");
}

module.exports = { apiList, startsWithHttp };
