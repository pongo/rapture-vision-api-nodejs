"use strict";

const { apiList } = require("../../../utils/api-utils");
const npmLibs = require("./npm-libs");
const rapidApis = require("./rapidapis");

/** @type {import("./shared.d.ts").TiktokApis} */
const apis = [
  // ["fail", async (id) => Err("Fail", { remaining: 100, reset: 1 })],
  // ["ok", async (id) => Ok({ videos: ["https://video.mp4"] })],

  ...apiList(npmLibs),
  ...apiList(rapidApis),
];

module.exports = { apis };
