"use strict";

const Snaptik = require("snaptik");
const tobyg74 = require("@tobyg74/tiktok-api-dl");
const TikChan = require("tikchan");
const prevter = require("@prevter/tiktok-scraper").fetchVideo;
const BtchDownloader = require("btch-downloader").ttdl;
const tiklydownSanzy = require("tiklydown-sanzy");
const tiktod = require("tiktod").download;
const TikTokNoWatermark = require("tiktok-no-watermark-api");
const { TiktokFactory, assertLongUrl } = require("./shared");
const nayan = require("nayan-media-downloader").tikdown;
const { startsWithHttp } = require("../../../utils/starts-with-http");

const fetchSnaptik = TiktokFactory("tiktok/snaptik", {
  async fetchFn(url) {
    const snaptik = new Snaptik(url);
    return await snaptik.download();
  },
  parseFn(data) {
    if (data?.status === 200 && data?.link_1?.startsWith("http")) {
      return { videos: [data.link_1, data.link_2, data.link_3].filter(startsWithHttp) };
    }
  },
});

const fetchTobyg74_v1 = TiktokFactory("tiktok/tobyg74_v1", {
  async fetchFn(url) {
    return await tobyg74.Downloader(url, { version: "v1" });
  },
  parseFn(data) {
    if (data?.status === "success" && data?.result?.video?.length > 0) {
      return { videos: data?.result?.video.filter(startsWithHttp) };
    }
  },
});

const fetchTobyg74_v2 = TiktokFactory("tiktok/tobyg74_v2", {
  async fetchFn(url) {
    return await tobyg74.Downloader(url, { version: "v2" });
  },
  parseFn(data) {
    if (data?.status === "success" && data.result) {
      return {
        videos: [data.result.video].filter(startsWithHttp),
      };
    }
  },
});

const fetchTobyg74_v3 = TiktokFactory("tiktok/tobyg74_v3", {
  async fetchFn(url) {
    return await tobyg74.Downloader(url, { version: "v3" });
  },
  parseFn(data) {
    if (data?.status === "success" && data.result) {
      return {
        videos: [data.result.video1, data.result.video2, data.result.video_hd].filter(
          startsWithHttp,
        ),
      };
    }
  },
});

const fetchTikChan = TiktokFactory("tiktok/TikChan", {
  async fetchFn(url) {
    return await TikChan.download(url);
  },
  parseFn(data) {
    return { videos: [data?.no_wm, data?.wm].filter(startsWithHttp) };
  },
});

const fetchPrevter = TiktokFactory("tiktok/prevter", {
  async fetchFn(url) {
    return await prevter(url);
  },
  parseFn(data) {
    return {
      videos: [data?.videoNoWatermark?.url, data?.videoWatermark?.url].filter(startsWithHttp),
    };
  },
});

const fetchBtchDownloader = TiktokFactory("tiktok/BtchDownloader", {
  async fetchFn(url) {
    return await BtchDownloader(url);
  },
  parseFn(data) {
    return { videos: data?.video?.filter(startsWithHttp) };
  },
});

const fetchTiklydownSanzy1 = TiktokFactory("tiktok/tiklydownSanzy1", {
  async fetchFn(url) {
    return await tiklydownSanzy.v1(url);
  },
  parseFn(data) {
    if (data.video) {
      return { videos: [data.video.noWatermark, data.video.watermark].filter(startsWithHttp) };
    }
  },
});

const fetchTiktod = TiktokFactory("tiktok/tiktod", {
  async fetchFn(url) {
    return await tiktod(url);
  },
  parseFn(data) {
    if (data?.status === 200 && data.result) {
      return { videos: [data.result.media].filter(startsWithHttp) };
    }
  },
});

const fetchTikTokNoWatermark = TiktokFactory("tiktok/TikTokNoWatermark", {
  async fetchFn(url) {
    return await TikTokNoWatermark(url, true);
  },
  parseFn(data) {
    if (data?.status === "ok" && data?.result?.details) {
      return { videos: [data.result.details.video_url].filter(startsWithHttp) };
    }
  },
});

const fetchNayan = TiktokFactory("tiktok/nayan", {
  async fetchFn(url) {
    return await nayan(url);
  },
  parseFn(data) {
    if (data?.status && data.data) {
      return { videos: [data.data.video].filter(startsWithHttp) };
    }
  },
});

// const fetchSmth = TiktokFactory("tiktok/nayan", {
//   async fetchFn(url) {
//     return await nayan(url);
//   },
//   parseFn(data) {
//     // if (data?.status === "success" && data.result) {
//     //   return [data.result.video_hd, data.result.video1, data.result.video2].filter(startsWithHttp);
//     // }
//   },
// });

module.exports = {
  // fetchSmth,
  fetchSnaptik,
  fetchTobyg74_v1,
  fetchTobyg74_v2,
  fetchTobyg74_v3,
  fetchTikChan,
  fetchPrevter,
  fetchBtchDownloader,
  fetchTiklydownSanzy1,
  fetchTiktod,
  fetchTikTokNoWatermark,
  fetchNayan,
};
