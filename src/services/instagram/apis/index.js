"use strict";

const npmLibs = require("./npm-libs");
const rapidApis = require("./rapidapis");

/** @type {import("./shared.d.ts").InstagramApis} */
const _npmLibs = Object.keys(npmLibs).map((key) => [key.replace(/^fetch/, ""), npmLibs[key]]);

/** @type {import("./shared.d.ts").InstagramApis} */
const _rapidApis = Object.keys(rapidApis).map((key) => [key.replace(/^fetch/, ""), rapidApis[key]]);

/** @type {import("./shared.d.ts").InstagramApis} */
const apis = [
  // ["fail", async ({ id }) => Err("Fail", { remaining: 100, reset: 1 })],

  ..._npmLibs,
  ..._rapidApis,
];

module.exports = { apis };
