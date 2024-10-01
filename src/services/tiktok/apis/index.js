"use strict";

const npmLibs = require("./npm-libs");
const rapidApis = require("./rapidapis");

/**
 * @template T
 * @type {Array<[string, import("../../../utils/balancer").ApiFn<T>]>}
 */
const apis = [
  // ["fail", async ({ id }) => Err("Fail", { remaining: 100, reset: 1 })],

  // npm libs
  ["fetchSnaptik", npmLibs.fetchSnaptik],
  ["fetchTobyg74_v1", npmLibs.fetchTobyg74_v1],
  ["fetchTobyg74_v2", npmLibs.fetchTobyg74_v2],
  ["fetchTobyg74_v3", npmLibs.fetchTobyg74_v3],
  ["fetchTikChan", npmLibs.fetchTikChan],
  ["fetchPrevter", npmLibs.fetchPrevter],
  ["fetchBtchDownloader", npmLibs.fetchBtchDownloader],
  ["fetchTiklydownSanzy1", npmLibs.fetchTiklydownSanzy1],
  ["fetchTiktod", npmLibs.fetchTiktod],
  ["fetchTikTokNoWatermark", npmLibs.fetchTikTokNoWatermark],
  ["fetchNayan", npmLibs.fetchNayan],

  // rapid api
  ["fetchMaatootz", rapidApis.fetchMaatootz],
  ["fetchMaatootz2", rapidApis.fetchMaatootz2],
  ["fetchTiktok82", rapidApis.fetchTiktok82],
  ["fetchYi005", rapidApis.fetchYi005],
  ["fetchVoyagel", rapidApis.fetchVoyagel],
  ["fetchLittlesun123", rapidApis.fetchLittlesun123],
  ["fetchLittlesun123tapi15", rapidApis.fetchLittlesun123tapi15],
  ["fetchOmarmhaimdat", rapidApis.fetchOmarmhaimdat],
  ["fetchLlbbmm", rapidApis.fetchLlbbmm],
  ["fetchJoTucker", rapidApis.fetchJoTucker],
];

module.exports = { apis };
