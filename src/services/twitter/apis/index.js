"use strict";

const rapidApis = require("./rapidapis");

/**
 * @template T
 * @type {Array<[string, import("../../../utils/balancer").ApiFn<T>]>}
 */
const apis = [
  // ["fail", async ({ id }) => Err("Fail", { remaining: 100, reset: 1 })],
  // rapid api
  ["fetchOmarmhaimdat24", rapidApis.fetchOmarmhaimdat24],
  ["fetchGlavier135TweetDetail", rapidApis.fetchGlavier135TweetDetail],
  // // ["fetchGlavier135Tweet", rapidApis.fetchGlavier135Tweet],
  ["fetchDavethebeast241", rapidApis.fetchDavethebeast241],
  ["fetchAbcdsxg1TweetResultByRestId", rapidApis.fetchAbcdsxg1TweetResultByRestId],
  ["fetchRestocked47", rapidApis.fetchRestocked47],
];

module.exports = { apis };
