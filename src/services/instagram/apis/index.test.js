import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Ok } from "../../../utils/result.js";
import { apis } from "./index.js";

const posts = {
  Cf4PRxnlMUa: { images: 1, videos: 0 },
  CnpKCjYPyd6: { images: 1, videos: 1 },
};

describe("instagram apis", () => {
  const skip = /** @type {Set<string>} */ (new Set([]));
  for (const [name, twitterFetchFn] of apis) {
    if (skip.has(name)) {
      console.log("skip", name);
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
        actual.value.reset = undefined;
        actual.value.remaining = undefined;
        assert.deepEqual(actual.value.images.length, expected.images, "images");
        assert.deepEqual(actual.value.videos.length, expected.videos, "videos");
      });

      it(`${id}, but empty`, async () => {
        const actual = await fetchFn(id, { loadFromDisk: true, fakeLoadFromDiskData: Ok({}) });
        assert(actual.isErr);
        assert.equal(actual.error.name, "FetchEmpty");
      });
    }
  });
}
