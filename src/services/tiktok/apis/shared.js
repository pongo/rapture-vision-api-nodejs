"use strict";

const { StacklessError } = require("../../../utils/stackless-error");
const { parseTiktokUrl } = require("../parse-tiktok-url");
const { FetchFactory } = require("../../../utils/fetch-factory");

function tmpFileNameFn(videoUrl) {
  const tiktok = parseTiktokUrl(videoUrl);
  return tiktok?.id ?? tiktok?.shortcode ?? videoUrl.replaceAll("/", "_");
}

function assertLongUrl(url) {
  const parsed = parseTiktokUrl(url);
  if (parsed.id == null && parsed.username == null) {
    throw new StacklessError("Only supports long url", { url });
  }
  return true;
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

module.exports = { assertLongUrl, assertId, TiktokFactory, tmpFileNameFn };
