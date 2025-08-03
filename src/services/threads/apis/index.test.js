import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Ok } from "../../../utils/result.js";
import { apis } from "./index.js";

const posts = {
  "https://www.threads.com/@homo_euntes/post/DM2MllzNzIB": { images: 1, videos: 0 },
  "https://www.threads.com/@kik_f_lm/post/DD2IlgBS6GR": { images: 1, videos: 1 },
};

describe("threads apis", () => {
  const skip = /** @type {Set<string>} */ (new Set([]));
  for (const [name, fetchFn] of apis) {
    if (skip.has(name)) {
      console.log("skip", name);
      continue;
    }
    testThreads(name, fetchFn);
  }
});

function testThreads(name, fetchFn) {
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
