"use strict";

const { StacklessError } = require("../../../utils/stackless-error");
const { parseTiktokUrl } = require("../parse-tiktok-url");
const { FetchFactory } = require("../../../utils/fetch-factory");

function tmpFileNameFn(videoUrl) {
  const tiktok = parseTiktokUrl(videoUrl);
  return tiktok?.id ?? tiktok?.shortcode ?? videoUrl.replaceAll("/", "_");
}

if (process.env.NODE_ENV === "test" && require.main === module) {
  const assert = require("node:assert/strict");
  const { describe, it } = require("node:test");

  describe("tmpFileNameFn()", () => {
    it("should parse id from url", () => {
      assert.equal(tmpFileNameFn("https://vt.tiktok.com/ZSNwYG2DD/"), "ZSNwYG2DD");
    });

    it("should return prepared url if not parsed", () => {
      assert.equal(
        tmpFileNameFn("https://tiktok.com/not-parsed/"),
        "https:__tiktok.com_not-parsed_",
      );
    });
  });
}

function assertLongUrl(url) {
  const parsed = parseTiktokUrl(url);
  if (parsed.id == null && parsed.username == null) {
    throw new StacklessError("Only supports long url", { url });
  }
  return true;
}

if (process.env.NODE_ENV === "test" && require.main === module) {
  const assert = require("node:assert/strict");
  const { test } = require("node:test");

  test("assertLongUrl", () => {
    assert.throws(() => assertLongUrl("https://vt.tiktok.com/ZSNwYG2DD/"));
    assert.doesNotThrow(() =>
      assertLongUrl("https://www.tiktok.com/@andakitty/video/7295937209176214816"),
    );
  });
}

function assertId(url) {
  const parsed = parseTiktokUrl(url);
  if (parsed.id == null) {
    throw new StacklessError("Video id not found", { url });
  }
  return true;
}

function checkFn({ videos }) {
  return Array.isArray(videos) && videos.length > 0;
}

function TiktokFactory(apiName, options) {
  return FetchFactory(apiName, { checkFn, tmpFileNameFn, ...options });
}

module.exports = { assertLongUrl, assertId, TiktokFactory };
