import { FetchFactory } from "../../../utils/fetch-factory.js";
import { StacklessError } from "../../../utils/stackless-error.js";
import { parseTiktokUrl } from "../parse-tiktok-url.js";

export function tmpFileNameFn(videoUrl) {
  const tiktok = parseTiktokUrl(videoUrl);
  return tiktok?.id ?? tiktok?.shortcode ?? videoUrl.replaceAll("/", "_");
}

export function assertLongUrl(url) {
  const parsed = parseTiktokUrl(url);
  if (parsed.id == null && parsed.username == null) {
    throw new StacklessError("Only supports long url", { url });
  }
  return true;
}

export function assertId(url) {
  const parsed = parseTiktokUrl(url);
  if (parsed.id == null) {
    throw new StacklessError("Video id not found", { url });
  }
  return true;
}

function checkFn({ videos }) {
  return Array.isArray(videos) && videos.length > 0;
}

export function TiktokFactory(apiName, options) {
  return FetchFactory(apiName, { checkFn, tmpFileNameFn, ...options });
}
