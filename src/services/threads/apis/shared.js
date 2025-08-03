import { startsWithHttp } from "../../../utils/api-utils.js";
import { FetchFactory } from "../../../utils/fetch-factory.js";

function tmpFileNameFn(id) {
  return id;
}

function isTrue(x) {
  return x === true;
}

function checkFn({ images, videos }) {
  return (
    [checkUrlsArray(images), checkUrlsArray(videos)].every(isTrue) &&
    (images.length > 0 || videos.length > 0)
  );
}

function checkUrlsArray(urls) {
  if (!Array.isArray(urls)) return false;
  if (urls.length === 0) return true;
  if (Array.isArray(urls[0])) return urls.map(checkUrlsArray).every(isTrue);
  return urls.some(startsWithHttp);
}

export function ThreadsFactory(apiName, options) {
  return FetchFactory(apiName, { checkFn, tmpFileNameFn, ...options });
}

export function getThreadsShortcode(url) {
  const regex = /https?:\/\/(?:www\.)?threads\.com\/@[\w.-_]+\/post\/([\w\-_]+)/i;
  const match = url.match(regex);
  return match ? match[1] : undefined;
}
