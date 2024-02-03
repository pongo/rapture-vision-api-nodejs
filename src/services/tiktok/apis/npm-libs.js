"use strict";

const Snaptik = require("snaptik");
const { TiktokDL } = require("@tobyg74/tiktok-api-dl");
const TikChan = require("tikchan");
const axios = require("axios");
const cheerio = require("cheerio");
const prevter = require("@prevter/tiktok-scraper").fetchVideo;
const BtchDownloader = require("btch-downloader").ttdl;
const { tiktokurl } = require("tiktokurl");
const tiklydownSanzy = require("tiklydown-sanzy");
const tiktod = require("tiktod").download;
const TikTokNoWatermark = require("tiktok-no-watermark-api");
const { TiktokFactory, assertLongUrl } = require("./shared");
const nayan = require("nayan-media-downloader").tikdown;
const fetch = require("node-fetch"); // TODO: удалить при переходе на node >= 18
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

if (process.env.NODE_ENV === "test" && require.main === module) {
  const assert = require("node:assert/strict");
  const { test } = require("node:test");

  test("fetchSnaptik", async () => {
    const res = await fetchSnaptik("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
    assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
    assert.equal(res.value.videos.length, 2);
    assert.match(res.value.videos[0], /^https:\/\/d.rapidcdn.app\/d\?token=/);
    assert.match(res.value.videos[1], /^https:\/\/d.rapidcdn.app\/d\?token=/);
  });
}

const fetchTobyg74_v1 = TiktokFactory("tiktok/tobyg74_v1", {
  async fetchFn(url) {
    return await TiktokDL(url, { version: "v1" });
  },
  parseFn(data) {
    if (data?.status === "success" && data?.result?.video?.length > 0) {
      return { videos: data?.result?.video.filter(startsWithHttp) };
    }
  },
});

if (process.env.NODE_ENV === "test" && require.main === module) {
  const assert = require("node:assert/strict");
  const { test } = require("node:test");

  test("fetchTobyg74_v1", async () => {
    const res = await fetchTobyg74_v1("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
    assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
    assert.equal(res.value.videos.length, 3);
    assert.match(res.value.videos[0], /^https:\/\/v\d+.tiktokcdn.com/);
    assert.match(res.value.videos[1], /^https:\/\/v\d+.tiktokcdn.com/);
    assert.match(res.value.videos[2], /^https:\/\/api-h\d+.tiktokv.com/);
  });
}

const fetchTobyg74_v3 = TiktokFactory("tiktok/tobyg74_v3", {
  async fetchFn(url) {
    return await TiktokDL(url, { version: "v3" });
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

if (process.env.NODE_ENV === "test" && require.main === module) {
  const assert = require("node:assert/strict");
  const { test } = require("node:test");

  test("fetchTobyg74_v3", async () => {
    const res = await fetchTobyg74_v3("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
    assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
    assert.equal(res.value.videos.length, 3);
    assert.match(res.value.videos[0], /^https:\/\/musdown.xyz/);
    assert.match(res.value.videos[1], /^https:\/\/v\d+m-default.akamaized.net/);
    assert.match(res.value.videos[2], /^https:\/\/cdn\d+.musdown.xyz/);
  });
}

const fetchTikChan = TiktokFactory("tiktok/TikChan", {
  async fetchFn(url) {
    return await TikChan.download(url);
  },
  parseFn(data) {
    return { videos: [data?.no_wm, data?.wm].filter(startsWithHttp) };
  },
});

if (process.env.NODE_ENV === "test" && require.main === module) {
  const assert = require("node:assert/strict");
  const { test } = require("node:test");

  test("fetchTikChan", async () => {
    const res = await fetchTikChan("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
    assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
    assert.equal(res.value.videos.length, 2);
    assert.match(res.value.videos[0], /^https:\/\/ttdownloader.com/);
    assert.match(res.value.videos[1], /^https:\/\/ttdownloader.com/);
  });
}

// https://github.com/swherden/tiktok-scraper-nowatermarks/blob/main/src/index.ts
async function TiktokScraperNowatermarks(videoUrl) {
  return new Promise((resolve, reject) => {
    if (!videoUrl || videoUrl.length === 0) {
      reject(new Error("No video URL provided"));
    }
    fetch("https://tikfast.net/en")
      .then((mainResponse) => {
        const cookie = mainResponse.headers.get("set-cookie");
        if (cookie) {
          fetch("https://tikfast.net/tik-download/download-link", {
            headers: {
              accept: "application/json, text/javascript, */*; q=0.01",
              "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
              "content-type": "application/json",
              "sec-ch-ua": '"Chromium";v="106", "Google Chrome";v="106", "Not;A=Brand";v="99"',
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": '"macOS"',
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "x-requested-with": "XMLHttpRequest",
              cookie,
              Referer: "https://tikfast.net/en",
              "Referrer-Policy": "strict-origin-when-cross-origin",
            },
            body: `{"0": "${videoUrl}"}`,
            method: "POST",
          })
            .then((downloadLinkResponse) => downloadLinkResponse.json())
            .then((downloadLinkJson) => {
              if (
                downloadLinkJson &&
                downloadLinkJson.status === "ok" &&
                downloadLinkJson.code === 200 &&
                downloadLinkJson.data &&
                downloadLinkJson.data.length > 0
              ) {
                const { data } = downloadLinkJson;
                for (const dataItem of data) {
                  const link =
                    dataItem === null || dataItem === void 0 ? void 0 : dataItem.water_free_link;
                  if (link) {
                    fetch("https://tikfast.net/tik-download/download", {
                      headers: {
                        accept: "application/json, text/javascript, */*; q=0.01",
                        "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
                        "content-type": "application/json",
                        "sec-ch-ua":
                          '"Chromium";v="106", "Google Chrome";v="106", "Not;A=Brand";v="99"',
                        "sec-ch-ua-mobile": "?0",
                        "sec-ch-ua-platform": '"macOS"',
                        "sec-fetch-dest": "empty",
                        "sec-fetch-mode": "cors",
                        "sec-fetch-site": "same-origin",
                        "x-requested-with": "XMLHttpRequest",
                        cookie,
                        Referer: "https://tikfast.net/en",
                        "Referrer-Policy": "strict-origin-when-cross-origin",
                      },
                      body: `{"url": "${link}"}`,
                      method: "POST",
                    })
                      .then((downloadResponse) => downloadResponse.json())
                      .then((downloadJson) => {
                        if (
                          downloadJson.status === "ok" &&
                          downloadJson.code === 200 &&
                          downloadJson.data &&
                          downloadJson.data.length > 0
                        ) {
                          const responseData = downloadJson.data[0];
                          if (responseData) {
                            responseData.description = downloadLinkJson.data[0].description;
                            responseData.cover_url = downloadLinkJson.data[0].cover_url;
                            resolve(responseData);
                          } else {
                            reject(new Error("[Fetching download] No data found"));
                          }
                        } else {
                          reject(new Error("[Fetching download] error"));
                        }
                      })
                      .catch((err) => reject(err));
                  } else {
                    reject(new Error("[Fetching download link] No link found"));
                  }
                }
              } else {
                reject(new Error("[Fetching download-link] error"));
              }
            })
            .catch((err) => reject(err));
        } else {
          reject(new Error("No cookie found"));
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

const fetchTiktokScraperNowatermarks = TiktokFactory("tiktok/TiktokScraperNowatermarks", {
  async fetchFn(url) {
    return await TiktokScraperNowatermarks(url);
  },
  parseFn(data) {
    return { videos: [data.url].filter(startsWithHttp) };
  },
  checkUrlFn: assertLongUrl,
});

if (process.env.NODE_ENV === "test" && require.main === module) {
  const assert = require("node:assert/strict");
  const { describe, it } = require("node:test");

  describe("fetchTiktokScraperNowatermarks", () => {
    it("long url", async () => {
      const res = await fetchTiktokScraperNowatermarks(
        "https://www.tiktok.com/@andakitty/video/7295937209176214816",
        { loadFromDisk: true },
      );
      assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
      assert.equal(res.value.videos.length, 1);
      assert.match(res.value.videos[0], /^https:\/\/v\d+m.tiktokcdn.com/);
    });

    it("not support short urls", async () => {
      const res = await fetchTiktokScraperNowatermarks("https://vt.tiktok.com/ZSNwYG2DD/", {
        loadFromDisk: true,
      });
      assert.ok(res.isErr);
      assert.match(res.error.message, /Only supports long url/);
    });
  });
}

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

if (process.env.NODE_ENV === "test" && require.main === module) {
  const assert = require("node:assert/strict");
  const { test } = require("node:test");

  test("fetchPrevter", async () => {
    const res = await fetchPrevter("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
    assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
    assert.equal(res.value.videos.length, 2);
    assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
    assert.match(res.value.videos[1], /^https:\/\/v\d+m-default.akamaized.net/);
  });
}

const fetchBtchDownloader = TiktokFactory("tiktok/BtchDownloader", {
  async fetchFn(url) {
    return await BtchDownloader(url);
  },
  parseFn(data) {
    return { videos: data?.video?.filter(startsWithHttp) };
  },
});

if (process.env.NODE_ENV === "test" && require.main === module) {
  const assert = require("node:assert/strict");
  const { test } = require("node:test");

  test("fetchBtchDownloader", async () => {
    const res = await fetchBtchDownloader("https://vt.tiktok.com/ZSNwYG2DD/", {
      loadFromDisk: true,
    });
    assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
    assert.equal(res.value.videos.length, 1);
    assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
  });
}

const fetchTiktokurl = TiktokFactory("tiktok/tiktokurl", {
  async fetchFn(url) {
    return await tiktokurl(url);
  },
  parseFn(data) {
    return { videos: [data.video].filter(startsWithHttp) };
  },
});

if (process.env.NODE_ENV === "test" && require.main === module) {
  const assert = require("node:assert/strict");
  const { test } = require("node:test");

  test("fetchTiktokurl", async () => {
    const res = await fetchTiktokurl("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
    assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
    assert.equal(res.value.videos.length, 1);
    assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
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

const fetchRuhend = TiktokFactory("tiktok/ruhend", {
  async fetchFn(url) {
    return await ruhend(url);
  },
  parseFn(data) {
    return { videos: [data.video].filter(startsWithHttp) };
  },
});

if (process.env.NODE_ENV === "test" && require.main === module) {
  const assert = require("node:assert/strict");
  const { test } = require("node:test");

  test("fetchRuhend", async () => {
    const res = await fetchRuhend("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
    assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
    assert.equal(res.value.videos.length, 1);
    assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
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

const fetchKaveesha = TiktokFactory("tiktok/kaveesha", {
  async fetchFn(url) {
    return await kaveesha(url);
  },
  parseFn(data) {
    return { videos: [data.video].filter(startsWithHttp) };
  },
});

if (process.env.NODE_ENV === "test" && require.main === module) {
  const assert = require("node:assert/strict");
  const { test } = require("node:test");

  test("fetchKaveesha", async () => {
    const res = await fetchKaveesha("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
    assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
    assert.equal(res.value.videos.length, 1);
    assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
  });
}

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

if (process.env.NODE_ENV === "test" && require.main === module) {
  const assert = require("node:assert/strict");
  const { test } = require("node:test");

  test("fetchTiklydownSanzy1", async () => {
    const res = await fetchTiklydownSanzy1("https://vt.tiktok.com/ZSNwYG2DD/", {
      loadFromDisk: true,
    });
    assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
    assert.equal(res.value.videos.length, 2);
    assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
    assert.match(res.value.videos[1], /^https:\/\/v\d+m-default.akamaized.net/);
  });
}

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

if (process.env.NODE_ENV === "test" && require.main === module) {
  const assert = require("node:assert/strict");
  const { test } = require("node:test");

  test("fetchTiktod", async () => {
    const res = await fetchTiktod("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
    assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
    assert.equal(res.value.videos.length, 1);
    assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
  });
}

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

if (process.env.NODE_ENV === "test" && require.main === module) {
  const assert = require("node:assert/strict");
  const { test } = require("node:test");

  test("fetchTikTokNoWatermark", async () => {
    const res = await fetchTikTokNoWatermark("https://vt.tiktok.com/ZSNwYG2DD/", {
      loadFromDisk: true,
    });
    assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
    assert.equal(res.value.videos.length, 1);
    assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
  });
}

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

if (process.env.NODE_ENV === "test" && require.main === module) {
  const assert = require("node:assert/strict");
  const { test } = require("node:test");

  test("fetchNayan", async () => {
    const res = await fetchNayan("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
    assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
    assert.equal(res.value.videos.length, 1);
    assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
  });
}

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
  fetchTobyg74_v3,
  fetchTikChan,
  fetchTiktokScraperNowatermarks,
  fetchPrevter,
  fetchBtchDownloader,
  fetchTiktokurl,
  fetchRuhend,
  fetchKaveesha,
  fetchTiklydownSanzy1,
  fetchTiktod,
  fetchTikTokNoWatermark,
  fetchNayan,
};
