"use strict";

const rapidApis = require("./rapidapis");

/** @type {import("./shared.d.ts").TwitterApis} */
const _rapidApis = Object.keys(rapidApis).map((key) => [key, rapidApis[key]]);

/** @type {import("./shared.d.ts").TwitterApis} */
const apis = [
  // ["fail", async ({ id }) => Err("Fail", { remaining: 100, reset: 1 })],

  ..._rapidApis,
];

module.exports = { apis };
