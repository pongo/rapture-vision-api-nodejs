"use strict";

const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const { apis } = require(".");

const posts = {
  Cf4PRxnlMUa: { images: 1, videos: 0 },
  CnpKCjYPyd6: { images: 1, videos: 1 },
};

describe("instagram apis", () => {
  const skip = /** @type {Set<string>} */ (new Set([]));
  for (const [name, twitterFetchFn] of apis) {
    if (skip.has(name)) {
      console.log("skip ", name);
      continue;
    }
    testInstagram(name, twitterFetchFn);
  }
});

function testInstagram(name, fetchFn) {
  describe(name, () => {
    for (const [id, expected] of Object.entries(posts)) {
      // if (id !== "1748738014690304393") continue;
      it(id, async () => {
        const actual = await fetchFn(id, { loadFromDisk: true });
        assert.ok(actual.isOk, actual.error);
        delete actual.value.reset;
        delete actual.value.remaining;
        assert.deepEqual(actual.value.images.length, expected.images, "images");
        assert.deepEqual(actual.value.videos.length, expected.videos, "videos");
      });
    }
  });
}
