"use strict";

const instagramUrlDirect = require("instagram-url-direct");
const { igdl: ruhend } = require("ruhend-scraper");
const { ndown } = require("nayan-media-downloader");
const { igdl: btch } = require("btch-downloader");

const { InstagramFactory, urlFromId, splitUrls } = require("./shared");

const emptyResult = { images: [], videos: [] };

const fetchInstagramUrlDirect = InstagramFactory("instagram/instagram-url-direct", {
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

const fetchRuhend = InstagramFactory("instagram/ruhend", {
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

const fetchNayan = InstagramFactory("instagram/nayan", {
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

const fetchBtch = InstagramFactory("instagram/btch", {
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

module.exports = {
  fetchInstagramUrlDirect,
  fetchRuhend,
  fetchNayan,
  fetchBtch,
};
