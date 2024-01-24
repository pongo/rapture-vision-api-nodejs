"use strict";

const { parseTiktokUrl } = require("../parse-tiktok-url");

function startsWithHttp(str) {
  return str?.startsWith("http");
}

function tmpFileNameFn(videoUrl) {
  const tiktok = parseTiktokUrl(videoUrl);
  return tiktok?.id ?? tiktok?.shortcode ?? videoUrl.replaceAll("/", "_");
}

if (globalThis.UVU_DEFER) {
  const assert = require("uvu/assert");
  const { describe } = require("tests/utils");
  describe("tmpFileNameFn()", (it) => {
    it("should parse id from url", () => {
      assert.is(tmpFileNameFn("https://vt.tiktok.com/ZSNwYG2DD/"), "ZSNwYG2DD");
    });
    it("should return prepared url if not parsed", () => {
      assert.is(tmpFileNameFn("https://tiktok.com/not-parsed/"), "https:__tiktok.com_not-parsed_");
    });
  });
}

module.exports = { startsWithHttp, tmpFileNameFn };
