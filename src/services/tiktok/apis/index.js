"use strict";

const npmLibs = require("./npm-libs");
const rapidApis = require("./rapidapis");
const { startsWithHttp } = require("./shared");

/**
 * @type {Array<[string, function(url: string)]>}
 */
const apis = [
  // ["fail", async ({ id }) => Err("Fail", { remaining: 100, reset: 1 })],

  // npm libs
  ["fetchSnaptik", npmLibs.fetchSnaptik],
  ["fetchTobyg74_v1", npmLibs.fetchTobyg74_v1],
  ["fetchTobyg74_v3", npmLibs.fetchTobyg74_v3],
  ["fetchTikChan", npmLibs.fetchTikChan],
  ["fetchTiktokScraperNowatermarks", npmLibs.fetchTiktokScraperNowatermarks],
  ["fetchPrevter", npmLibs.fetchPrevter],
  ["fetchBtchDownloader", npmLibs.fetchBtchDownloader],
  ["fetchTiktokurl", npmLibs.fetchTiktokurl],
  ["fetchRuhend", npmLibs.fetchRuhend],
  ["fetchKaveesha", npmLibs.fetchKaveesha],
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

if (process.env.NODE_ENV === "test" && require.main === module) {
  const assert = require("node:assert/strict");
  const { describe, it } = require("node:test");

  describe("tiktok apis", () => {
    for (const [name, apiFn] of apis) {
      testTiktok(name, apiFn);
    }
  });

  function testTiktok(name, apiFn) {
    it(name, async () => {
      switch (name) {
        case "fetchTiktokScraperNowatermarks":
        case "fetchTiktok82":
          await testLongUrl(apiFn);
          await testShortUrlNotAllowed(apiFn, /Only supports long url/);
          break;

        case "fetchOmarmhaimdat":
          await testLongUrl(apiFn);
          await testShortUrlNotAllowed(apiFn, /Video id not found/);
          break;

        default:
          await testShortUrl(apiFn);
          break;
      }
    });
  }

  async function testLongUrl(apiFn) {
    const res = await apiFn("https://www.tiktok.com/@andakitty/video/7295937209176214816", {
      loadFromDisk: true,
    });
    assertResult(res);
  }

  async function testShortUrl(apiFn) {
    const res = await apiFn("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
    assertResult(res);
  }

  async function testShortUrlNotAllowed(apiFn, errorMatch) {
    const res = await apiFn("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
    assert.ok(res.isErr);
    assert.match(res.error.message, errorMatch);
  }

  function assertResult(res) {
    assert.ok(res.isOk, res?.error);
    assertVideos(res.value.videos);
  }

  function assertVideos(videos) {
    assert.ok(Array.isArray(videos), videos);
    assert.ok(videos.filter(startsWithHttp).length > 0, videos);
  }
}

module.exports = { apis };
