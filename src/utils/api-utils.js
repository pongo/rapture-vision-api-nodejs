"use strict";

const reFetch = /^fetch/;

/** @type {import("./api-utils.d.ts").apiList} */
function apiList(apis) {
  return Object.keys(apis).map((key) => [key.replace(reFetch, ""), apis[key]]);
}

module.exports = { apiList };
