"use strict";

const { requestRapidApi } = require("../../../utils/rapidapi");
const { StacklessError } = require("../../../utils/stackless-error");
const { startsWithHttp } = require("../../../utils/starts-with-http");
const { parseTiktokUrl } = require("../parse-tiktok-url");
const { TiktokFactory, assertLongUrl, assertId } = require("./shared");

/*

TODO: 500 https://rapidapi.com/iq.faceok/api/tiktok89/
TODO: failed https://rapidapi.com/TerminalWarlord/api/tiktok-info/
TODO: 404 https://rapidapi.com/tikwm-tikwm-default/api/tiktok-scraper7/

*/

// https://rapidapi.com/maatootz/api/tiktok-full-info-without-watermark/
const fetchMaatootz = TiktokFactory("tiktok/maatootz", {
  async fetchFn(url) {
    return await requestRapidApi(
      "GET",
      "https://tiktok-full-info-without-watermark.p.rapidapi.com/vid/index",
      {
        host: "tiktok-full-info-without-watermark.p.rapidapi.com",
        params: { url },
        parseLimitsFn(response) {
          return {
            remaining: parseInt(
              response.headers["x-ratelimit-video-without-watermark-%2f-music-remaining"],
              10,
            ),
            reset: parseInt(
              response.headers["x-ratelimit-video-without-watermark-%2f-music-reset"],
              10,
            ),
          };
        },
      },
    );
  },
  parseFn({ remaining, reset, data }) {
    const videos = [...data.video, ...data.OriginalWatermarkedVideo].filter(startsWithHttp);
    return { videos, remaining, reset };
  },
});

if (process.env.NODE_ENV === "test" && require.main === module) {
  const assert = require("node:assert/strict");
  const { test } = require("node:test");

  test("fetchMaatootz", async () => {
    const res = await fetchMaatootz("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
    assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
    assert.equal(res.value.videos.length, 2);
    assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
    assert.match(res.value.videos[1], /^https:\/\/v\d+m-default.akamaized.net/);
  });
}

// https://rapidapi.com/maatootz/api/tiktok-downloader-download-tiktok-videos-without-watermark/
const fetchMaatootz2 = TiktokFactory("tiktok/maatootz2", {
  async fetchFn(url) {
    return await requestRapidApi(
      "GET",
      "https://tiktok-downloader-download-tiktok-videos-without-watermark.p.rapidapi.com/index",
      {
        host: "tiktok-downloader-download-tiktok-videos-without-watermark.p.rapidapi.com",
        params: { url },
      },
    );
  },
  parseFn({ remaining, reset, data }) {
    const videos = [...data.video, ...data.OriginalWatermarkedVideo].filter(startsWithHttp);
    return { videos, remaining, reset };
  },
});

if (process.env.NODE_ENV === "test" && require.main === module) {
  const assert = require("node:assert/strict");
  const { test } = require("node:test");

  test("fetchMaatootz2", async () => {
    const res = await fetchMaatootz2("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
    assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
    assert.equal(res.value.videos.length, 2);
    assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
    assert.match(res.value.videos[1], /^https:\/\/v\d+m-default.akamaized.net/);
  });
}

// https://rapidapi.com/datauniverse/api/tiktok82/
const fetchTiktok82 = TiktokFactory("tiktok/tiktok82", {
  async fetchFn(url) {
    return await requestRapidApi("GET", "https://tiktok82.p.rapidapi.com/getDownloadVideo", {
      host: "tiktok82.p.rapidapi.com",
      params: { video_url: url },
    });
  },
  parseFn({ remaining, reset, data }) {
    if (data.success && Array.isArray(data.url_list)) {
      const videos = data.url_list.filter(startsWithHttp);
      return { videos, remaining, reset };
    }
    return { remaining, reset };
  },
  checkUrlFn: assertLongUrl,
});

if (process.env.NODE_ENV === "test" && require.main === module) {
  const assert = require("node:assert/strict");
  const { describe, it } = require("node:test");

  describe("fetchTiktok82", () => {
    it("long url", async () => {
      const res = await fetchTiktok82(
        "https://www.tiktok.com/@andakitty/video/7295937209176214816",
        { loadFromDisk: true },
      );
      assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
      assert.equal(res.value.videos.length, 3);
      assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
      assert.match(res.value.videos[1], /^https:\/\/v16m.byteicdn.com/);
      assert.match(res.value.videos[2], /^https:\/\/api16-normal-c-useast1a.tiktokv.com/);
    });

    it("not support short urls", async () => {
      const res = await fetchTiktok82("https://vt.tiktok.com/ZSNwYG2DD/", {
        loadFromDisk: true,
      });
      assert.ok(res.isErr);
      assert.match(res.error.message, /Only supports long url/);
    });
  });
}

// https://rapidapi.com/yi005/api/tiktok-download-without-watermark/
const fetchYi005 = TiktokFactory("tiktok/yi005", {
  async fetchFn(url) {
    return await requestRapidApi(
      "GET",
      "https://tiktok-download-without-watermark.p.rapidapi.com/analysis",
      {
        host: "tiktok-download-without-watermark.p.rapidapi.com",
        params: { url, hd: "0" },
      },
    );
  },
  parseFn({ remaining, reset, data }) {
    if (data.msg === "success" && data.data) {
      const videos = [/* data.data?.hdplay, */ data.data?.play, data.data?.wmplay].filter(
        startsWithHttp,
      );
      return { videos, remaining, reset };
    }
    return { remaining, reset };
  },
});

if (process.env.NODE_ENV === "test" && require.main === module) {
  const assert = require("node:assert/strict");
  const { test } = require("node:test");

  test("fetchYi005", async () => {
    const res = await fetchYi005("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
    assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
    assert.equal(res.value.videos.length, 2);
    assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
    assert.match(res.value.videos[1], /^https:\/\/v\d+m-default.akamaized.net/);
  });
}

// https://rapidapi.com/liuzhaolong765481/api/tiktok-video-feature-summary/
const fetchVoyagel = TiktokFactory("tiktok/voyagel", {
  async fetchFn(url) {
    return await requestRapidApi("GET", "https://tiktok-video-feature-summary.p.rapidapi.com/", {
      host: "tiktok-video-feature-summary.p.rapidapi.com",
      params: { url, hd: "0" },
    });
  },
  parseFn({ remaining, reset, data }) {
    if (data.msg === "success" && data.data) {
      const videos = [/* data.data?.hdplay, */ data.data?.play, data.data?.wmplay].filter(
        startsWithHttp,
      );
      return { videos, remaining, reset };
    }
    return { remaining, reset };
  },
});

if (process.env.NODE_ENV === "test" && require.main === module) {
  const assert = require("node:assert/strict");
  const { test } = require("node:test");

  test("fetchVoyagel", async () => {
    const res = await fetchVoyagel("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
    assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
    assert.equal(res.value.videos.length, 2);
    assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
    assert.match(res.value.videos[1], /^https:\/\/v\d+m-default.akamaized.net/);
  });
}

// https://rapidapi.com/littlesun123/api/tiktok-video-no-watermark10/
const fetchLittlesun123 = TiktokFactory("tiktok/littlesun123", {
  async fetchFn(url) {
    return await requestRapidApi(
      "GET",
      "https://tiktok-video-no-watermark10.p.rapidapi.com/index/Tiktok/getVideoInfo",
      {
        host: "tiktok-video-no-watermark10.p.rapidapi.com",
        params: { url, hd: "0" },
        parseLimitsFn(response) {
          return {
            remaining: parseInt(response.headers["x-ratelimit-request-remaining"], 10),
            reset: parseInt(response.headers["x-ratelimit-request-reset"], 10),
          };
        },
      },
    );
  },
  parseFn({ remaining, reset, data }) {
    if (data.msg === "success" && data.data) {
      const videos = [/* data.data?.hdplay, */ data.data?.play, data.data?.wmplay].filter(
        startsWithHttp,
      );
      return { videos, remaining, reset };
    }
    return { remaining, reset };
  },
});

if (process.env.NODE_ENV === "test" && require.main === module) {
  const assert = require("node:assert/strict");
  const { test } = require("node:test");

  test("fetchLittlesun123", async () => {
    const res = await fetchLittlesun123("https://vt.tiktok.com/ZSNwYG2DD/", { loadFromDisk: true });
    assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
    assert.equal(res.value.videos.length, 2);
    assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
    assert.match(res.value.videos[1], /^https:\/\/v\d+m-default.akamaized.net/);
  });
}

// https://rapidapi.com/omarmhaimdat/api/tiktok-api6/
const fetchOmarmhaimdat = TiktokFactory("tiktok/omarmhaimdat", {
  async fetchFn(url) {
    const parsed = parseTiktokUrl(url);
    if (parsed.id == null) {
      throw new StacklessError("Id not found", { url });
    }
    return await requestRapidApi("GET", "https://tiktok-api6.p.rapidapi.com/video/details", {
      host: "tiktok-api6.p.rapidapi.com",
      params: { video_id: parsed.id },
    });
  },
  parseFn({ remaining, reset, data }) {
    const videos = [data?.details?.download_url].filter(startsWithHttp);
    return { videos, remaining, reset };
  },
  checkUrlFn: assertId,
});

if (process.env.NODE_ENV === "test" && require.main === module) {
  const assert = require("node:assert/strict");
  const { describe, it } = require("node:test");

  describe("fetchOmarmhaimdat", () => {
    it("supports urls with id", async () => {
      const res = await fetchOmarmhaimdat(
        "https://www.tiktok.com/@andakitty/video/7295937209176214816",
        { loadFromDisk: true },
      );
      assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
      assert.equal(res.value.videos.length, 1);
      assert.match(res.value.videos[0], /^https:\/\/v16-webapp-prime.tiktok.com/);
    });

    it("not supports short urls", async () => {
      const res = await fetchOmarmhaimdat("https://vt.tiktok.com/ZSNwYG2DD/", {
        loadFromDisk: true,
      });
      assert.ok(res.isErr);
      assert.match(res.error.message, /Video id not found/);
    });
  });
}

// https://rapidapi.com/littlesun123/api/tiktok-api15/
const fetchLittlesun123tapi15 = TiktokFactory("tiktok/littlesun123_tapi15", {
  async fetchFn(url) {
    return await requestRapidApi(
      "GET",
      "https://tiktok-api15.p.rapidapi.com/index/Tiktok/getVideoInfo",
      {
        host: "tiktok-api15.p.rapidapi.com",
        params: { url, hd: "0" },
      },
    );
  },
  parseFn({ remaining, reset, data }) {
    if (data.msg === "success" && data.data) {
      const videos = [/* data.data?.hdplay, */ data.data?.play, data.data?.wmplay].filter(
        startsWithHttp,
      );
      return { videos, remaining, reset };
    }
    return { remaining, reset };
  },
});

if (process.env.NODE_ENV === "test" && require.main === module) {
  const assert = require("node:assert/strict");
  const { test } = require("node:test");

  test("fetchLittlesun123tapi15", async () => {
    const res = await fetchLittlesun123tapi15("https://vt.tiktok.com/ZSNwYG2DD/", {
      loadFromDisk: true,
    });
    assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
    assert.equal(res.value.videos.length, 2);
    assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
    assert.match(res.value.videos[1], /^https:\/\/v\d+m-default.akamaized.net/);
  });
}

// https://rapidapi.com/llbbmm/api/tiktok-download5/
const fetchLlbbmm = TiktokFactory("tiktok/llbbmm", {
  async fetchFn(url) {
    return await requestRapidApi("GET", "https://tiktok-download5.p.rapidapi.com/getVideo", {
      host: "tiktok-download5.p.rapidapi.com",
      params: { url, hd: "0" },
    });
  },
  parseFn({ remaining, reset, data }) {
    if (data.msg === "success" && data.data) {
      const videos = [/* data.data?.hdplay, */ data.data?.play, data.data?.wmplay].filter(
        startsWithHttp,
      );
      return { videos, remaining, reset };
    }
    return { remaining, reset };
  },
});

if (process.env.NODE_ENV === "test" && require.main === module) {
  const assert = require("node:assert/strict");
  const { test } = require("node:test");

  test("fetchLlbbmm", async () => {
    const res = await fetchLlbbmm("https://vt.tiktok.com/ZSNwYG2DD/", {
      loadFromDisk: true,
    });
    assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
    assert.equal(res.value.videos.length, 2);
    assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
    assert.match(res.value.videos[1], /^https:\/\/v\d+m-default.akamaized.net/);
  });
}

// https://rapidapi.com/JoTucker/api/tiktok-scraper2/
const fetchJoTucker = TiktokFactory("tiktok/JoTucker", {
  async fetchFn(url) {
    return await requestRapidApi(
      "GET",
      "https://tiktok-scraper2.p.rapidapi.com/video/no_watermark",
      {
        host: "tiktok-scraper2.p.rapidapi.com",
        params: { video_url: url },
      },
    );
  },
  parseFn({ remaining, reset, data }) {
    const videos = [data?.no_watermark].filter(startsWithHttp);
    return { videos, remaining, reset };
  },
});

if (process.env.NODE_ENV === "test" && require.main === module) {
  const assert = require("node:assert/strict");
  const { test } = require("node:test");

  test("fetchJoTucker", async () => {
    const res = await fetchJoTucker("https://vt.tiktok.com/ZSNwYG2DD/", {
      loadFromDisk: true,
    });
    assert.ok(res.isOk, `${res?.error?.name}: ${res?.error?.message}`);
    assert.equal(res.value.videos.length, 1);
    assert.match(res.value.videos[0], /^https:\/\/v\d+m-default.akamaized.net/);
  });
}

// const fetchSmth = TiktokFactory("tiktok/JoTucker", {
//   async fetchFn(url) {
//     return await requestRapidApi(
//       "GET",
//       "https://tiktok-scraper2.p.rapidapi.com/video/no_watermark",
//       {
//         host: "tiktok-scraper2.p.rapidapi.com",
//         params: { video_url: url },
//         parseLimitsFn(response) {
//           console.log(response.headers);
//           console.log(
//             response.headers["x-ratelimit-requests-remaining"],
//             response.headers["x-ratelimit-requests-reset"],
//           );
//           return {
//             remaining: parseInt(response.headers["x-ratelimit-requests-remaining"], 10),
//             reset: parseInt(response.headers["x-ratelimit-requests-reset"], 10),
//           };
//         },
//       },
//     );
//   },
//   parseFn({ remaining, reset, data }) {
//     // const videos = [data?.details?.download_url].filter(startsWithHttp);
//     // return { videos, remaining, reset };
//   },
// });

module.exports = {
  // fetchSmth,
  fetchMaatootz,
  fetchMaatootz2,
  fetchTiktok82,
  fetchYi005,
  fetchVoyagel,
  fetchLittlesun123,
  fetchLittlesun123tapi15,
  fetchOmarmhaimdat,
  fetchLlbbmm,
  fetchJoTucker,
};
