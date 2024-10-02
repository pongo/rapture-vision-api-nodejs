"use strict";

const npmLibs = require("./npm-libs");
const rapidApis = require("./rapidapis");

/**
 * @template T
 * @type {Array<[string, import("../../../utils/balancer").ApiFn<T>]>}
 */
const _npmLibs = Object.keys(npmLibs).map((key) => [key, npmLibs[key]]);

/**
 * @template T
 * @type {Array<[string, import("../../../utils/balancer").ApiFn<T>]>}
 */
const _rapidApis = Object.keys(rapidApis).map((key) => [key, rapidApis[key]]);

/**
 * @template T
 * @type {Array<[string, import("../../../utils/balancer").ApiFn<T>]>}
 */
const apis = [
  // ["fail", async ({ id }) => Err("Fail", { remaining: 100, reset: 1 })],
  ..._npmLibs,
  ..._rapidApis,
];

module.exports = { apis };
