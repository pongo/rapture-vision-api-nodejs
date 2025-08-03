import { jwtDecode } from "jwt-decode";
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

export function InstagramFactory(apiName, options) {
  return FetchFactory(apiName, { checkFn, tmpFileNameFn, ...options });
}

export function urlFromId(id) {
  return `https://www.instagram.com/p/${id}/`;
}

const reImage = /\.(webp|jpe?g|png|avif|jfif|jxl|hei[cf]|jpe)/i;

export function splitUrls(urls) {
  const uniqUrls = [...new Set(urls)];

  const images = [];
  const videos = [];
  for (const url of uniqUrls) {
    if (!startsWithHttp(url)) {
      continue;
    }
    const jwt = extractAndDecodeJWT(url);
    const target_url = jwt?.url ?? url;
    const url_lower = target_url.toLowerCase();
    if (
      reImage.test(url_lower) ||
      reImage.test(jwt?.url ?? "") ||
      reImage.test(jwt?.filename ?? "")
    ) {
      images.push(target_url);
    } else {
      videos.push(target_url);
    }
  }
  return { images, videos };
}

function extractAndDecodeJWT(url) {
  try {
    const parsedUrl = new URL(url);
    const token = parsedUrl.searchParams.get("token");
    if (!token) return null;
    return jwtDecode(token);
  } catch {
    return null;
  }
}
