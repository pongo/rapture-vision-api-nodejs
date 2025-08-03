import assert from "node:assert/strict";
import { test } from "node:test";
import { formatErr } from "../../../../tests/utils/utils.js";
import { fetchUniversalDownloader } from "./npm-libs.js";

test("fetchUniversalDownloader", async () => {
  const res = await fetchUniversalDownloader(
    "https://www.threads.com/@homo_euntes/post/DM2MllzNzIB",
    {
      loadFromDisk: true,
    },
  );
  assert.ok(res.isOk, formatErr(res));
  assert.equal(res.value.images.length, 1);
  assert.match(res.value.images[0], /^https/);
});
