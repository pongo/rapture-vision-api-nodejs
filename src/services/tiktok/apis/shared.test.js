"use strict";
const assert = require("node:assert/strict");
const { describe, it, test } = require("node:test");
const { tmpFileNameFn, assertLongUrl } = require("./shared");

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
