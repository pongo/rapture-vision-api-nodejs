import { igdl as btch } from "btch-downloader";
import instagramUrlDirect from "instagram-url-direct";
import nayanPkg from "nayan-videos-downloader";
import { igdl as ruhend } from "ruhend-scraper";

import { InstagramFactory, splitUrls, urlFromId } from "./shared.js";

const { ndown } = nayanPkg;
const emptyResult = { images: [], videos: [] };

export const fetchInstagramUrlDirect = InstagramFactory("instagram/instagram-url-direct", {
  /** @returns {Promise<{url_list?: string[]}>} */
  async fetchFn(id) {
    return await instagramUrlDirect(urlFromId(id));
  },
  parseFn(data) {
    if (data?.url_list && data.url_list.length > 0) {
      return splitUrls(data.url_list);
    }
    return { ...emptyResult };
  },
});

export const fetchRuhend = InstagramFactory("instagram/ruhend", {
  async fetchFn(id) {
    return await ruhend(urlFromId(id));
  },
  parseFn(data) {
    if (data?.status && data.data && data.data.length > 0) {
      return splitUrls(data.data.map((x) => x.url));
    }
    return { ...emptyResult };
  },
});

export const fetchNayan = InstagramFactory("instagram/nayan", {
  async fetchFn(id) {
    return await ndown(urlFromId(id));
  },
  parseFn(data) {
    if (data?.status && data.data && data.data.length > 0) {
      return splitUrls(data.data.map((x) => x.url));
    }
    return { ...emptyResult };
  },
});

export const fetchBtch = InstagramFactory("instagram/btch", {
  async fetchFn(id) {
    return await btch(urlFromId(id));
  },
  parseFn(data) {
    if (data && data.length > 0) {
      return splitUrls(data.map((x) => x.url));
    }
    return { ...emptyResult };
  },
});
