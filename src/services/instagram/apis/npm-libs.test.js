"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");
const { fetchInstagramUrlDirect, fetchRuhend, fetchNayan, fetchBtch } = require("./npm-libs");

const image_and_video = "CnpKCjYPyd6";
const reCdnInstagram = /^https\:\/\/scontent\.cdninstagram\.com/;
const reRapidCdn = /^https:\/\/d.rapidcdn.app\/d\?token=/;

test("fetchInstagramUrlDirect", async () => {
  const res = await fetchInstagramUrlDirect(image_and_video, {
    loadFromDisk: true,
  });
  assert.ok(res.isOk, res.isErr && `${res.error.name}: ${res.error.message}`);
  assert.equal(res.value.images.length, 1);
  assert.match(res.value.images[0], reCdnInstagram);
  assert.equal(res.value.videos.length, 1);
  assert.match(res.value.videos[0], reCdnInstagram);
});

test("fetchRuhend", async () => {
  const res = await fetchRuhend(image_and_video, {
    loadFromDisk: true,
  });
  assert.ok(res.isOk, res.isErr && `${res.error.name}: ${res.error.message}`);
  assert.equal(res.value.images.length, 1);
  assert.match(res.value.images[0], reCdnInstagram);
  assert.equal(res.value.videos.length, 1);
  assert.match(res.value.videos[0], reRapidCdn);
});

test("fetchNayan", async () => {
  const res = await fetchNayan(image_and_video, {
    loadFromDisk: true,
  });
  assert.ok(res.isOk, res.isErr && `${res.error.name}: ${res.error.message}`);
  assert.equal(res.value.images.length, 1);
  assert.match(res.value.images[0], reCdnInstagram);
  assert.equal(res.value.videos.length, 1);
  assert.match(res.value.videos[0], reRapidCdn);
});

test("fetchBtch", async () => {
  const res = await fetchBtch(image_and_video, {
    loadFromDisk: true,
  });
  assert.ok(res.isOk, res.isErr && `${res.error.name}: ${res.error.message}`);
  assert.equal(res.value.images.length, 1);
  assert.match(res.value.images[0], reCdnInstagram);
  assert.equal(res.value.videos.length, 1);
  assert.match(res.value.videos[0], reRapidCdn);
});
