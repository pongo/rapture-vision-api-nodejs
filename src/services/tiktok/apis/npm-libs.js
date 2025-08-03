import { fetchVideo as prevter } from "@prevter/tiktok-scraper";
import tobyg74 from "@tobyg74/tiktok-api-dl";
import { ttdl as BtchDownloader } from "btch-downloader";
import Snaptik from "snaptik";
import TikChan from "tikchan";
import tiklydownSanzy from "tiklydown-sanzy";
import { download as tiktod } from "tiktod";
import TikTokNoWatermark from "tiktok-no-watermark-api";
import nayanPkg from "../../../apis/nayan-videos-downloader.js";
import { startsWithHttp } from "../../../utils/api-utils.js";
import { TiktokFactory } from "./shared.js";

const nayan = nayanPkg.tikdown;

const emptyResult = { videos: [] };

export const fetchSnaptik = TiktokFactory("tiktok/snaptik", {
  async fetchFn(url) {
    const snaptik = new Snaptik(url);
    return await snaptik.download();
  },
  parseFn(data) {
    if (data?.status === 200) {
      return { videos: [data.link_1, data.link_2, data.link_3].filter(startsWithHttp) };
    }
    return { ...emptyResult };
  },
});

export const fetchTobyg74_v1 = TiktokFactory("tiktok/tobyg74_v1", {
  async fetchFn(url) {
    return await tobyg74.Downloader(url, { version: "v1" });
  },
  /** @param {object} data */
  parseFn(data) {
    if (data?.status === "success" && Array.isArray(data?.result?.video)) {
      return { videos: data.result.video.filter(startsWithHttp) };
    }
    return { ...emptyResult };
  },
});

export const fetchTobyg74_v2 = TiktokFactory("tiktok/tobyg74_v2", {
  async fetchFn(url) {
    return await tobyg74.Downloader(url, { version: "v2" });
  },
  parseFn(data) {
    if (data?.status === "success" && data.result) {
      return { videos: [data.result?.video ?? ""].filter(startsWithHttp) };
    }
    return { ...emptyResult };
  },
});

export const fetchTobyg74_v3 = TiktokFactory("tiktok/tobyg74_v3", {
  async fetchFn(url) {
    return await tobyg74.Downloader(url, { version: "v3" });
  },
  parseFn(data) {
    if (data?.status === "success" && data.result) {
      return {
        videos: [
          data.result.video1,
          data.result.video2,
          data.result.videoHD,
          data.result["video_hd"],
        ].filter(startsWithHttp),
      };
    }
    return { ...emptyResult };
  },
});

export const fetchTikChan = TiktokFactory("tiktok/TikChan", {
  async fetchFn(url) {
    return await TikChan.download(url);
  },
  parseFn(data) {
    return { videos: [data?.no_wm, data?.wm].filter(startsWithHttp) };
  },
});

export const fetchPrevter = TiktokFactory("tiktok/prevter", {
  async fetchFn(url) {
    return await prevter(url);
  },
  parseFn(data) {
    return {
      videos: [data?.videoNoWatermark?.url, data?.videoWatermark?.url].filter(startsWithHttp),
    };
  },
});

export const fetchBtchDownloader = TiktokFactory("tiktok/BtchDownloader", {
  async fetchFn(url) {
    return await BtchDownloader(url);
  },
  parseFn(data) {
    return { videos: data?.video?.filter(startsWithHttp) ?? [] };
  },
});

export const fetchTiklydownSanzy1 = TiktokFactory("tiktok/tiklydownSanzy1", {
  async fetchFn(url) {
    return await tiklydownSanzy.v1(url);
  },
  parseFn(data) {
    if (data.video) {
      return { videos: [data.video.noWatermark, data.video.watermark].filter(startsWithHttp) };
    }
    return { ...emptyResult };
  },
});

export const fetchTiktod = TiktokFactory("tiktok/tiktod", {
  async fetchFn(url) {
    return await tiktod(url);
  },
  parseFn(data) {
    if (data?.status === 200 && data.result) {
      return { videos: [data.result.media].filter(startsWithHttp) };
    }
    return { ...emptyResult };
  },
});

export const fetchTikTokNoWatermark = TiktokFactory("tiktok/TikTokNoWatermark", {
  async fetchFn(url) {
    return await TikTokNoWatermark(url, true);
  },
  parseFn(data) {
    if (data?.status === "ok" && data?.result?.details) {
      return { videos: [data.result.details.video_url].filter(startsWithHttp) };
    }
    return { ...emptyResult };
  },
});

export const fetchNayan = TiktokFactory("tiktok/nayan", {
  async fetchFn(url) {
    return await nayan(url);
  },
  parseFn(data) {
    if (data?.status && data.data) {
      return { videos: [data.data.video].filter(startsWithHttp) };
    }
    return { ...emptyResult };
  },
});
