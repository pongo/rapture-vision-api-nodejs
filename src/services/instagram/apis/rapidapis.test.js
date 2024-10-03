"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");
const { fetchRocketApi, fetchLooter2 } = require("./rapidapis");
const { formatErr } = require("../../../utils/testing-utils");

const image_and_video = "CnpKCjYPyd6";
const reCdnInstagram = /^https\:\/\/scontent.*?\.cdninstagram\.com/i;
const reRapidCdn = /^https:\/\/d.rapidcdn.app\/d\?token=/i;
const reFbcdn = /^https\:\/\/.+?\.fbcdn\.net/i;

test("fetchRocketApi", async () => {
  const res = await fetchRocketApi(image_and_video, {
    loadFromDisk: true,
  });
  assert.ok(res.isOk, formatErr(res));
  assert.equal(res.value.images.length, 1);
  assert.match(res.value.images[0], reFbcdn);
  assert.equal(res.value.videos.length, 1);
  assert.match(res.value.videos[0], reFbcdn);
});

test("fetchLooter2", async () => {
  const res = await fetchLooter2(image_and_video, {
    loadFromDisk: true,
  });
  assert.ok(res.isOk, formatErr(res));
  assert.equal(res.value.images.length, 1);
  assert.match(res.value.images[0], reCdnInstagram);
  assert.equal(res.value.videos.length, 1);
  assert.match(res.value.videos[0], reCdnInstagram);
});
