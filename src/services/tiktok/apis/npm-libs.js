"use strict";

const Snaptik = require("snaptik");
const { parseTiktokUrl } = require("../parse-tiktok-url");
const { FetchFactory } = require("../../../utils/fetch-factory");
const { TiktokDL } = require("@tobyg74/tiktok-api-dl");
const TikChan = require("tikchan");
const axios = require("axios");
const cheerio = require("cheerio");
const { StacklessError } = require("../../../utils/stackless-error");
const TiktokScraperNowatermarks = require("tiktok-scraper-nowatermarks").default;
const prevter = require("@prevter/tiktok-scraper").fetchVideo;
const BtchDownloader = require("btch-downloader").ttdl;
const { tiktokurl } = require("tiktokurl");
const tiklydownSanzy = require("tiklydown-sanzy");
const tiktod = require("tiktod").download;
const TikTokNoWatermark = require("tiktok-no-watermark-api");
const { startsWithHttp, tmpFileNameFn } = require("./shared");
const nayan = require("nayan-media-downloader").tikdown;

const fetchSnaptik = FetchFactory("tiktok/snaptik", {
  async fetchFn(url) {
    const snaptik = new Snaptik(url);
    return await snaptik.download();
  },
  parseFn(data) {
    if (data?.status === 200 && data?.link_1?.startsWith("http")) {
      return [data.link_1, data.link_2, data.link_3].filter(startsWithHttp);
    }
  },
  tmpFileNameFn,
});

if (globalThis.UVU_DEFER) {
  const assert = require("uvu/assert");
  const { describe } = require("tests/utils");

  describe("fetchSnaptik", (it) => {
    it("fetchSnaptik", async () => {
      const res = await fetchSnaptik("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
      assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
      assert.is(res.value.videos.length, 2);
      assert.match(res.value.videos[0], /^https:\/\/d.rapidcdn.app\/d\?token=/);
      assert.match(res.value.videos[1], /^https:\/\/d.rapidcdn.app\/d\?token=/);
    });
  });
}

const fetchTobyg74_v1 = FetchFactory("tiktok/tobyg74_v1", {
  async fetchFn(url) {
    return await TiktokDL(url, { version: "v1" });
  },
  parseFn(data) {
    if (data?.status === "success" && data?.result?.video?.length > 0) {
      return data?.result?.video.filter(startsWithHttp);
    }
  },
  tmpFileNameFn,
});

if (globalThis.UVU_DEFER) {
  const assert = require("uvu/assert");
  const { describe } = require("tests/utils");

  describe("fetchTobyg74_v1", (it) => {
    it("fetchTobyg74_v1", async () => {
      const res = await fetchTobyg74_v1("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
      assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
      assert.is(res.value.videos.length, 3);
      assert.match(res.value.videos[0], /^https:\/\/v\d+.tiktokcdn.com/);
      assert.match(res.value.videos[1], /^https:\/\/v\d+.tiktokcdn.com/);
      assert.match(res.value.videos[2], /^https:\/\/api-h\d+.tiktokv.com/);
    });
  });
}

const fetchTobyg74_v3 = FetchFactory("tiktok/tobyg74_v3", {
  async fetchFn(url) {
    return await TiktokDL(url, { version: "v3" });
  },
  parseFn(data) {
    if (data?.status === "success" && data.result) {
      return [data.result.video_hd, data.result.video1, data.result.video2].filter(startsWithHttp);
    }
  },
  tmpFileNameFn,
});

if (globalThis.UVU_DEFER) {
  const assert = require("uvu/assert");
  const { describe } = require("tests/utils");

  describe("fetchTobyg74_v3", (it) => {
    it("fetchTobyg74_v3", async () => {
      const res = await fetchTobyg74_v3("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
      assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
      assert.is(res.value.videos.length, 3);
      assert.match(res.value.videos[0], /^https:\/\/cdn\d+.musdown.xyz/);
      assert.match(res.value.videos[1], /^https:\/\/musdown.xyz/);
      assert.match(res.value.videos[2], /^https:\/\/v\d+m-default.akamaized.net/);
    });
  });
}

const fetchTikChan = FetchFactory("tiktok/TikChan", {
  async fetchFn(url) {
    return await TikChan.download(url);
  },
  parseFn(data) {
    return [data?.no_wm, data?.wm].filter(startsWithHttp);
  },
  tmpFileNameFn,
});

if (globalThis.UVU_DEFER) {
  const assert = require("uvu/assert");
  const { describe } = require("tests/utils");

  describe("fetchTikChan", (it) => {
    it("fetchTikChan", async () => {
      const res = await fetchTikChan("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
      assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
      assert.is(res.value.videos.length, 2);
      assert.match(res.value.videos[0], /^https:\/\/ttdownloader.com/);
      assert.match(res.value.videos[1], /^https:\/\/ttdownloader.com/);
    });
  });
}

const fetchTiktokScraperNowatermarks = FetchFactory("tiktok/TiktokScraperNowatermarks", {
  async fetchFn(url) {
    const parsed = parseTiktokUrl(url);
    if (parsed.id == null && parsed.username == null) {
      throw new StacklessError("Only supports long url");
    }
    return await TiktokScraperNowatermarks(url);
  },
  parseFn(data) {
    return [data.url].filter(startsWithHttp);
  },
  tmpFileNameFn,
});

if (globalThis.UVU_DEFER) {
  const assert = require("uvu/assert");
  const { describe } = require("tests/utils");

  describe("fetchTiktokScraperNowatermarks", (it) => {
    it("fetchTiktokScraperNowatermarks", async () => {
      const res = await fetchTiktokScraperNowatermarks(
        "https://www.tiktok.com/@andakitty/video/7295937209176214816",
        {
          loadFromDisk: true,
        }
      );
      assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
      assert.is(res.value.videos.length, 1);
      assert.match(res.value.videos[0], /^https:\/\/v\d+m.tiktokcdn.com/);
    });
    it("not support short urls", async () => {
      const res = await fetchTiktokScraperNowatermarks("https://vt.tiktok.com/ZSNwYG2DD/", {
        loadFromDisk: false,
      });
      assert.ok(res.isErr);
      assert.match(res.error.message, /Only supports long url/);
    });
  });
}

const fetchPrevter = FetchFactory("tiktok/prevter", {
  async fetchFn(url) {
    return await prevter(url);
  },
  parseFn(data) {
    return [data?.videoNoWatermark?.url, data?.videoWatermark?.url].filter(startsWithHttp);
  },
  tmpFileNameFn,
});

if (globalThis.UVU_DEFER) {
  const assert = require("uvu/assert");
  const { describe } = require("tests/utils");

  describe("fetchPrevter", (it) => {
    it("fetchPrevter", async () => {
      const res = await fetchPrevter("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
      assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
      assert.is(res.value.videos.length, 2);
      assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
      assert.match(res.value.videos[1], /^https:\/\/v\d+m-default.akamaized.net/);
    });
  });
}

const fetchBtchDownloader = FetchFactory("tiktok/BtchDownloader", {
  async fetchFn(url) {
    return await BtchDownloader(url);
  },
  parseFn(data) {
    return data?.video?.filter(startsWithHttp);
  },
  tmpFileNameFn,
});

if (globalThis.UVU_DEFER) {
  const assert = require("uvu/assert");
  const { describe } = require("tests/utils");

  describe("fetchBtchDownloader", (it) => {
    it("fetchBtchDownloader", async () => {
      const res = await fetchBtchDownloader("https://vt.tiktok.com/ZSNwYG2DD/", {
        loadFromDisk: true,
      });
      assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
      assert.is(res.value.videos.length, 1);
      assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
    });
  });
}

const fetchTiktokurl = FetchFactory("tiktok/tiktokurl", {
  async fetchFn(url) {
    return await tiktokurl(url);
  },
  parseFn(data) {
    return [data.video].filter(startsWithHttp);
  },
  tmpFileNameFn,
});

if (globalThis.UVU_DEFER) {
  const assert = require("uvu/assert");
  const { describe } = require("tests/utils");

  describe("fetchTiktokurl", (it) => {
    it("fetchTiktokurl", async () => {
      const res = await fetchTiktokurl("https://vt.tiktok.com/ZSNwYG2DD/", {
        loadFromDisk: true,
      });
      assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
      assert.is(res.value.videos.length, 1);
      assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
    });
  });
}

// https://www.npmjs.com/package/@ruhend/scraper
async function ruhend(url) {
  const res = await fetch("https://api.tiklydown.eu.org/api/download?url=" + url);
  const data = await res.json();
  // const _0x382096 = data.title;
  // const _0x36e7a1 = data.author.name;
  // const _0x2fc851 = data.author.unique_id;
  // const _0x117b58 = data.created_at;
  // const _0x1113af = data.stats.likeCount;
  // const _0x20f6b1 = data.stats.commentCount;
  // const _0x2d06be = data.stats.shareCount;
  // const _0x5d1f99 = data.stats.playCount;
  // const _0x3e5cec = data.stats.saveCount;
  // const _0xcbf9ee = data.video.noWatermark;
  // const _0xab1f2 = data.video.cover;
  // const _0x2cd8c7 = data.video.durationFormatted;
  // const _0x3340ca = data.music.play_url;
  // const _0x34e279 = data.music.cover_large;
  return {
    // title: _0x382096,
    // name: _0x36e7a1,
    // username: _0x2fc851,
    // published: _0x117b58,
    // like: _0x1113af,
    // comment: _0x20f6b1,
    // share: _0x2d06be,
    // views: _0x5d1f99,
    // bookmark: _0x3e5cec,
    video: data.video.noWatermark,
    // cover: _0xab1f2,
    // duration: _0x2cd8c7,
    // audio: _0x3340ca,
    // profilePicture: _0x34e279,
  };
}

const fetchRuhend = FetchFactory("tiktok/ruhend", {
  async fetchFn(url) {
    return await ruhend(url);
  },
  parseFn(data) {
    return [data.video].filter(startsWithHttp);
  },
  tmpFileNameFn,
});

if (globalThis.UVU_DEFER) {
  const assert = require("uvu/assert");
  const { describe } = require("tests/utils");

  describe("fetchRuhend", (it) => {
    it("fetchRuhend", async () => {
      const res = await fetchRuhend("https://vt.tiktok.com/ZSNwYG2DD/", {
        loadFromDisk: true,
      });
      assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
      assert.is(res.value.videos.length, 1);
      assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
    });
  });
}

// https://www.npmjs.com/package/@kaveesha-sithum/tiktok-dl
async function kaveesha(url) {
  try {
    const res = await axios.request("https://tools.revesery.com/tiktok/revesery.php?url=" + url, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "user-agent":
          "Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36",
      },
    });
    const $ = cheerio.load(res.data);
    return {
      status: true,
      // title: $("p").text().replace("Here's the result:", ""),
      // thumbnail: $("img").attr("src"),
      video: $("a.btn.btn-primary").attr("href"),
    };
  } catch {
    return {
      status: false,
    };
  }
}

const fetchKaveesha = FetchFactory("tiktok/kaveesha", {
  async fetchFn(url) {
    return await kaveesha(url);
  },
  parseFn(data) {
    return [data.video].filter(startsWithHttp);
  },
  tmpFileNameFn,
});

if (globalThis.UVU_DEFER) {
  const assert = require("uvu/assert");
  const { describe } = require("tests/utils");

  describe("fetchKaveesha", (it) => {
    it("fetchKaveesha", async () => {
      const res = await fetchKaveesha("https://vt.tiktok.com/ZSNwYG2DD/", {
        loadFromDisk: true,
      });
      assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
      assert.is(res.value.videos.length, 1);
      assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
    });
  });
}

const tiklydownSanzy1 = FetchFactory("tiktok/tiklydownSanzy1", {
  async fetchFn(url) {
    return await tiklydownSanzy.v1(url);
  },
  parseFn(data) {
    if (data.video) {
      return [data.video.noWatermark, data.video.watermark].filter(startsWithHttp);
    }
  },
  tmpFileNameFn,
});

if (globalThis.UVU_DEFER) {
  const assert = require("uvu/assert");
  const { describe } = require("tests/utils");

  describe("tiklydownSanzy1", (it) => {
    it("tiklydownSanzy1", async () => {
      const res = await tiklydownSanzy1("https://vt.tiktok.com/ZSNwYG2DD/", {
        loadFromDisk: true,
      });
      assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
      assert.is(res.value.videos.length, 2);
      assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
      assert.match(res.value.videos[1], /^https:\/\/v\d+m-default.akamaized.net/);
    });
  });
}

const fetchTiktod = FetchFactory("tiktok/tiktod", {
  async fetchFn(url) {
    return await tiktod(url);
  },
  parseFn(data) {
    if (data?.status === 200 && data.result) {
      return [data.result.media].filter(startsWithHttp);
    }
  },
  tmpFileNameFn,
});

if (globalThis.UVU_DEFER) {
  const assert = require("uvu/assert");
  const { describe } = require("tests/utils");

  describe("fetchTiktod", (it) => {
    it("fetchTiktod", async () => {
      const res = await fetchTiktod("https://vt.tiktok.com/ZSNwYG2DD/", {
        loadFromDisk: true,
      });
      assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
      assert.is(res.value.videos.length, 1);
      assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
    });
  });
}

const fetchTikTokNoWatermark = FetchFactory("tiktok/TikTokNoWatermark", {
  async fetchFn(url) {
    return await TikTokNoWatermark(url, true);
  },
  parseFn(data) {
    if (data?.status === "ok" && data?.result?.details) {
      return [data.result.details.video_url].filter(startsWithHttp);
    }
  },
  tmpFileNameFn,
});

if (globalThis.UVU_DEFER) {
  const assert = require("uvu/assert");
  const { describe } = require("tests/utils");

  describe("fetchTikTokNoWatermark", (it) => {
    it("fetchTikTokNoWatermark", async () => {
      const res = await fetchTikTokNoWatermark("https://vt.tiktok.com/ZSNwYG2DD/", {
        loadFromDisk: true,
      });
      assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
      assert.is(res.value.videos.length, 1);
      assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
    });
  });
}

const fetchNayan = FetchFactory("tiktok/nayan", {
  async fetchFn(url) {
    return await nayan(url);
  },
  parseFn(data) {
    if (data?.status && data.data) {
      return [data.data.video].filter(startsWithHttp);
    }
  },
  tmpFileNameFn,
});

if (globalThis.UVU_DEFER) {
  const assert = require("uvu/assert");
  const { describe } = require("tests/utils");

  describe("fetchNayan", (it) => {
    it("fetchNayan", async () => {
      const res = await fetchNayan("https://vt.tiktok.com/ZSNwYG2DD/", {
        loadFromDisk: true,
      });
      assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
      assert.is(res.value.videos.length, 1);
      assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
    });
  });
}

// const fetchSmth = FetchFactory("tiktok/nayan", {
//   async fetchFn(url) {
//     return await nayan(url);
//   },
//   parseFn(data) {
//     // if (data?.status === "success" && data.result) {
//     //   return [data.result.video_hd, data.result.video1, data.result.video2].filter(startsWithHttp);
//     // }
//   },
//   tmpFileNameFn,
// });

// TODO: uninstall: node-tiklydown tiktok-scraper @phaticusthiccy/open-apis social_media_downloader
module.exports = {
  fetchSnaptik,
  fetchTobyg74_v1,
  fetchTobyg74_v3,
  fetchTikChan,
  fetchTiktokScraperNowatermarks,
  fetchPrevter,
  fetchBtchDownloader,
  fetchTiktokurl,
  fetchRuhend,
  fetchKaveesha,
  tiklydownSanzy1,
  fetchTiktod,
  TikTokNoWatermark,
  fetchNayan,
  // fetchSmth,
};
