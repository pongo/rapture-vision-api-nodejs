import assert from "node:assert/strict";
import { describe, it, test } from "node:test";
import { assertLongUrl, tmpFileNameFn } from "./shared.js";

describe("tmpFileNameFn()", () => {
  it("should parse id from url", () => {
    assert.equal(tmpFileNameFn("https://vt.tiktok.com/ZSNwYG2DD/"), "ZSNwYG2DD");
  });

  it("should return prepared url if not parsed", () => {
    assert.equal(tmpFileNameFn("https://tiktok.com/not-parsed/"), "https:__tiktok.com_not-parsed_");
  });
});

test("assertLongUrl", () => {
  assert.throws(() => assertLongUrl("https://vt.tiktok.com/ZSNwYG2DD/"));
  assert.doesNotThrow(() =>
    assertLongUrl("https://www.tiktok.com/@andakitty/video/7295937209176214816"),
  );
});
