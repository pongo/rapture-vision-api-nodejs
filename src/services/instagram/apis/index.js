"use strict";

const { apiList } = require("../../../utils/api-utils");
const npmLibs = require("./npm-libs");
const rapidApis = require("./rapidapis");

/** @type {import("./shared.d.ts").InstagramApis} */
const apis = [
  // ["fail", async ({ id }) => Err("Fail", { remaining: 100, reset: 1 })],

  ...apiList(npmLibs),
  ...apiList(rapidApis),
];

module.exports = { apis };
