"use strict";

const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const { apis } = require(".");
const { startsWithHttp } = require("../../../utils/starts-with-http");
const { formatErr } = require("../../../utils/testing-utils");
const { Ok } = require("../../../utils/result");

describe("tiktok apis", () => {
  for (const [name, apiFn] of apis) {
    testTiktok(name, apiFn);
  }
});

function testTiktok(name, apiFn) {
  it(name, async () => {
    switch (name) {
      case "TiktokScraperNowatermarks":
      case "Tiktok82":
        await testLongUrl(apiFn);
        await testShortUrlNotAllowed(apiFn, /Only supports long url/);
        await testLongUrlWithEmptyFetch(apiFn);
        break;

      case "Omarmhaimdat":
        await testLongUrl(apiFn);
        await testShortUrlNotAllowed(apiFn, /Video id not found/);
        await testLongUrlWithEmptyFetch(apiFn);
        break;

      default:
        await testShortUrl(apiFn);
        await testShortUrlWithEmptyFetch(apiFn);
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

async function testLongUrlWithEmptyFetch(apiFn) {
  const res = await apiFn("https://www.tiktok.com/@andakitty/video/7295937209176214816", {
    loadFromDisk: true,
    fakeLoadFromDiskData: Ok({}),
  });
  assertEmptyResult(res);
}

async function testShortUrl(apiFn) {
  const res = await apiFn("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
  assertResult(res);
}

async function testShortUrlWithEmptyFetch(apiFn) {
  const res = await apiFn("https://vt.tiktok.com/ZSNwYG2DD/", {
    loadFromDisk: true,
    fakeLoadFromDiskData: Ok({}),
  });
  assertEmptyResult(res);
}

function assertEmptyResult(res) {
  assert(res.isErr);
  assert.equal(res.error.name, "FetchEmpty");
}

async function testShortUrlNotAllowed(apiFn, errorMatch) {
  const res = await apiFn("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
  assert.ok(res.isErr);
  assert.match(res.error.message, errorMatch);
}

function assertResult(res) {
  assert.ok(res.isOk, formatErr(res));
  assertVideos(res.value.videos);
}

function assertVideos(videos) {
  assert.ok(Array.isArray(videos), videos);
  assert.ok(videos.filter(startsWithHttp).length > 0, videos.toString());
}
