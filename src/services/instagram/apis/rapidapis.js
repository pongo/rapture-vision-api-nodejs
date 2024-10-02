"use strict";

const delay = require("node:timers/promises").setTimeout;
const { requestRapidApiFetch } = require("../../../utils/rapidapi");
const { StacklessError } = require("../../../utils/stackless-error");
const { startsWithHttp } = require("../../../utils/starts-with-http");
const { InstagramFactory, splitUrls, urlFromId } = require("./shared");

// https://rapidapi.com/rocketapi/api/rocketapi-for-instagram
const fetchRocketApi = InstagramFactory("instagram/rocketapi", {
  async fetchFn(id) {
    return await requestRapidApiFetch(
      "POST",
      "https://rocketapi-for-instagram.p.rapidapi.com/instagram/media/get_info_by_shortcode",
      {
        host: "rocketapi-for-instagram.p.rapidapi.com",
        body: { shortcode: id },
      },
    );
  },
  parseFn({ remaining, reset, data }) {
    const items = data?.response?.body?.items;
    if (items == null || items.length === 0) {
      return { remaining, reset };
    }

    const root = items[0];
    if (root?.carousel_media != null && root.carousel_media.length > 0) {
      return { ...splitUrls(root.carousel_media.map(parseOne)), remaining, reset };
    } else {
      return { ...splitUrls([parseOne(root)]), remaining, reset };
    }

    function parseOne(obj) {
      if (obj.media_type === 1) return obj.image_versions2.candidates[0].url;
      if (obj.media_type === 2) return obj.video_versions[0].url;
      throw Error("unknown media_type: " + obj.media_type);
    }
  },
});

// https://rapidapi.com/iq.faceok/api/instagram-looter2
const fetchLooter2 = InstagramFactory("instagram/looter2", {
  async fetchFn(id) {
    return await requestRapidApiFetch("GET", "https://instagram-looter2.p.rapidapi.com/post-dl", {
      host: "instagram-looter2.p.rapidapi.com",
      params: { url: urlFromId(id) },
    });
  },
  parseFn({ remaining, reset, data }) {
    if (data?.data?.medias && data.data.medias.length > 0) {
      const medias = data.data.medias;
      return {
        images: filterMedia(medias, "image"),
        videos: filterMedia(medias, "video"),
        remaining,
        reset,
      };
    }

    return { remaining, reset };

    function filterMedia(medias, mediaType) {
      return medias
        .filter((x) => x.type === mediaType)
        .map((x) => x.link)
        .filter(startsWithHttp);
    }
  },
});

module.exports = {
  fetchRocketApi,
  fetchLooter2,
};
