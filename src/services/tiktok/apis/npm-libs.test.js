import assert from "node:assert/strict";
import { test } from "node:test";
import { formatErr } from "../../../../tests/utils/utils.js";
import {
  fetchBtchDownloader,
  fetchNayan,
  fetchNayanAlldown,
  fetchPrevter,
  fetchSnaptik,
  fetchTikChan,
  fetchTiklydownSanzy1,
  fetchTiktod,
  fetchTikTokNoWatermark,
  fetchTobyg74_v1,
  fetchTobyg74_v2,
  fetchTobyg74_v3,
  fetchUniversalDownloader,
} from "./npm-libs.js";

test("fetchSnaptik", async () => {
  const res = await fetchSnaptik("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
  assert.ok(res.isOk, formatErr(res));
  assert.equal(res.value.videos.length, 2);
  assert.match(res.value.videos[0], /^https:\/\/d.rapidcdn.app\/d\?token=/);
  assert.match(res.value.videos[1], /^https:\/\/d.rapidcdn.app\/d\?token=/);
});

test("fetchTobyg74_v1", async () => {
  const res = await fetchTobyg74_v1("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
  assert.ok(res.isOk, formatErr(res));
  assert.equal(res.value.videos.length, 3);
  assert.match(res.value.videos[0], /^https:\/\/v\d+.tiktokcdn.com/);
  assert.match(res.value.videos[1], /^https:\/\/v\d+.tiktokcdn.com/);
  assert.match(res.value.videos[2], /^https:\/\/api-h\d+.tiktokv.com/);
});

test("fetchTobyg74_v2", async () => {
  const res = await fetchTobyg74_v2("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
  assert.ok(res.isOk, formatErr(res));
  assert.equal(res.value.videos.length, 1);
  assert.match(res.value.videos[0], /^https:\/\/tikcdn.io/);
});

test("fetchTobyg74_v3", async () => {
  const res = await fetchTobyg74_v3("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
  assert.ok(res.isOk, formatErr(res));
  assert.equal(res.value.videos.length, 3);
  assert.match(res.value.videos[0], /^https:\/\/musdown.xyz/);
  assert.match(res.value.videos[1], /^https:\/\/v\d+m-default.akamaized.net/);
  assert.match(res.value.videos[2], /^https:\/\/cdn\d+.musdown.xyz/);
});
test("fetchTikChan", async () => {
  const res = await fetchTikChan("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
  assert.ok(res.isOk, formatErr(res));
  assert.equal(res.value.videos.length, 2);
  assert.match(res.value.videos[0], /^https:\/\/ttdownloader.com/);
  assert.match(res.value.videos[1], /^https:\/\/ttdownloader.com/);
});

test("fetchPrevter", async () => {
  const res = await fetchPrevter("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
  assert.ok(res.isOk, formatErr(res));
  assert.equal(res.value.videos.length, 2);
  assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
  assert.match(res.value.videos[1], /^https:\/\/v\d+m-default.akamaized.net/);
});
test("fetchBtchDownloader", async () => {
  const res = await fetchBtchDownloader("https://vt.tiktok.com/ZSNwYG2DD/", {
    loadFromDisk: true,
  });
  assert.ok(res.isOk, formatErr(res));
  assert.equal(res.value.videos.length, 1);
  assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
});

test("fetchTiklydownSanzy1", async () => {
  const res = await fetchTiklydownSanzy1("https://vt.tiktok.com/ZSNwYG2DD/", {
    loadFromDisk: true,
  });
  assert.ok(res.isOk, formatErr(res));
  assert.equal(res.value.videos.length, 2);
  assert.match(res.value.videos[0], /^https:\/\/v16m-default.akamaized.net/);
  assert.match(res.value.videos[1], /^https:\/\/v16m-default.akamaized.net/);
});

test("fetchTiktod", async () => {
  const res = await fetchTiktod("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
  assert.ok(res.isOk, formatErr(res));
  assert.equal(res.value.videos.length, 1);
  assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
});

test("fetchUniversalDownloader", async () => {
  const res = await fetchUniversalDownloader("https://vt.tiktok.com/ZSNwYG2DD/", {
    loadFromDisk: true,
  });
  assert.ok(res.isOk, formatErr(res));
  assert.equal(res.value.videos.length, 2);
  assert.match(res.value.videos[0], /^https:\/\/v16m-default.tiktokcdn.com/);
});

test("fetchTikTokNoWatermark", async () => {
  const res = await fetchTikTokNoWatermark("https://vt.tiktok.com/ZSNwYG2DD/", {
    loadFromDisk: true,
  });
  assert.ok(res.isOk, formatErr(res));
  assert.equal(res.value.videos.length, 1);
  assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
});

test("fetchNayan", async () => {
  const res = await fetchNayan("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
  assert.ok(res.isOk, formatErr(res));
  assert.equal(res.value.videos.length, 1);
  assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
});

test("fetchNayanAlldown", async () => {
  const res = await fetchNayanAlldown("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
  assert.ok(res.isOk, formatErr(res));
  assert.equal(res.value.videos.length, 2);
  assert.match(res.value.videos[0], /^https/);
  assert.match(res.value.videos[1], /^https/);
});
