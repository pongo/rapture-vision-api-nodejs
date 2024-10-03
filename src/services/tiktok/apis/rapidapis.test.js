"use strict";

const assert = require("node:assert/strict");
const { describe, it, test } = require("node:test");
const {
  fetchMaatootz,
  fetchMaatootz2,
  fetchTiktok82,
  fetchYi005,
  fetchVoyagel,
  fetchLittlesun123,
  fetchOmarmhaimdat,
  fetchLittlesun123tapi15,
  fetchLlbbmm,
  fetchJoTucker,
} = require("./rapidapis");
const { formatErr } = require("../../../utils/testing-utils");

test("fetchMaatootz", async () => {
  const res = await fetchMaatootz("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
  assert.ok(res.isOk, formatErr(res));
  assert.equal(res.value.videos.length, 2);
  assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
  assert.match(res.value.videos[1], /^https:\/\/v\d+m-default.akamaized.net/);
});

test("fetchMaatootz2", async () => {
  const res = await fetchMaatootz2("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
  assert.ok(res.isOk, formatErr(res));
  assert.equal(res.value.videos.length, 2);
  assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
  assert.match(res.value.videos[1], /^https:\/\/v\d+m-default.akamaized.net/);
});

describe("fetchTiktok82", () => {
  it("long url", async () => {
    const res = await fetchTiktok82("https://www.tiktok.com/@andakitty/video/7295937209176214816", {
      loadFromDisk: true,
    });
    assert.ok(res.isOk, formatErr(res));
    assert.equal(res.value.videos.length, 3);
    assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
    assert.match(res.value.videos[1], /^https:\/\/v16m.byteicdn.com/);
    assert.match(res.value.videos[2], /^https:\/\/api16-normal-c-useast1a.tiktokv.com/);
  });

  it("not support short urls", async () => {
    const res = await fetchTiktok82("https://vt.tiktok.com/ZSNwYG2DD/", {
      loadFromDisk: true,
    });
    assert.ok(res.isErr);
    assert.match(res.error.message, /Only supports long url/);
  });
});

test("fetchYi005", async () => {
  const res = await fetchYi005("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
  assert.ok(res.isOk, formatErr(res));
  assert.equal(res.value.videos.length, 2);
  assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
  assert.match(res.value.videos[1], /^https:\/\/v\d+m-default.akamaized.net/);
});

test("fetchVoyagel", async () => {
  const res = await fetchVoyagel("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
  assert.ok(res.isOk, formatErr(res));
  assert.equal(res.value.videos.length, 2);
  assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
  assert.match(res.value.videos[1], /^https:\/\/v\d+m-default.akamaized.net/);
});

test("fetchLittlesun123", async () => {
  const res = await fetchLittlesun123("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
  assert.ok(res.isOk, formatErr(res));
  assert.equal(res.value.videos.length, 2);
  assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
  assert.match(res.value.videos[1], /^https:\/\/v\d+m-default.akamaized.net/);
});

describe("fetchOmarmhaimdat", () => {
  it("supports urls with id", async () => {
    const res = await fetchOmarmhaimdat(
      "https://www.tiktok.com/@andakitty/video/7295937209176214816",
      { loadFromDisk: true },
    );
    assert.ok(res.isOk, formatErr(res));
    assert.equal(res.value.videos.length, 1);
    assert.match(res.value.videos[0], /^https:\/\/v16-webapp-prime.tiktok.com/);
  });

  it("not supports short urls", async () => {
    const res = await fetchOmarmhaimdat("https://vt.tiktok.com/ZSNwYG2DD/", {
      loadFromDisk: true,
    });
    assert.ok(res.isErr);
    assert.match(res.error.message, /Video id not found/);
  });
});

test("fetchLittlesun123tapi15", async () => {
  const res = await fetchLittlesun123tapi15("https://vt.tiktok.com/ZSNwYG2DD/", {
    loadFromDisk: true,
  });
  assert.ok(res.isOk, formatErr(res));
  assert.equal(res.value.videos.length, 2);
  assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
  assert.match(res.value.videos[1], /^https:\/\/v\d+m-default.akamaized.net/);
});

test("fetchLlbbmm", async () => {
  const res = await fetchLlbbmm("https://vt.tiktok.com/ZSNwYG2DD/", {
    loadFromDisk: true,
  });
  assert.ok(res.isOk, formatErr(res));
  assert.equal(res.value.videos.length, 2);
  assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
  assert.match(res.value.videos[1], /^https:\/\/v\d+m-default.akamaized.net/);
});

test("fetchJoTucker", async () => {
  const res = await fetchJoTucker("https://vt.tiktok.com/ZSNwYG2DD/", {
    loadFromDisk: true,
  });
  assert.ok(res.isOk, formatErr(res));
  assert.equal(res.value.videos.length, 1);
  assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
});
