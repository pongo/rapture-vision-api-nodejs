import assert from "node:assert/strict";
import { test } from "node:test";
import { formatErr } from "../../../../tests/utils/utils.js";
import { fetchCoder2077, fetchLiucccccccccccc, fetchManhgcoder } from "./rapidapis.js";

test("fetchCoder2077", async () => {
  const res = await fetchCoder2077("https://www.threads.com/@homo_euntes/post/DM2MllzNzIB", {
    loadFromDisk: true,
  });
  assert.ok(res.isOk, formatErr(res));
  assert.equal(res.value.images.length, 1);
  assert.match(res.value.images[0], /^https/);
});

test("fetchManhgcoder", async () => {
  const res = await fetchManhgcoder("https://www.threads.com/@homo_euntes/post/DM2MllzNzIB", {
    loadFromDisk: true,
  });
  assert.ok(res.isOk, formatErr(res));
  assert.equal(res.value.images.length, 1);
  assert.match(res.value.images[0], /^https/);
});

test("fetchLiucccccccccccc", async () => {
  const res = await fetchLiucccccccccccc("https://www.threads.com/@homo_euntes/post/DM2MllzNzIB", {
    loadFromDisk: true,
  });
  assert.ok(res.isOk, formatErr(res));
  assert.equal(res.value.images.length, 1);
  assert.match(res.value.images[0], /^https/);
});
