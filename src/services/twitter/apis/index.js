"use strict";

const { apiList } = require("../../../utils/api-utils");
const rapidApis = require("./rapidapis");

/** @type {import("./shared.d.ts").TwitterApis} */
const apis = [
  // ["fail", async ({ id }) => Err("Fail", { remaining: 100, reset: 1 })],

  ...apiList(rapidApis),
];

module.exports = { apis };
