"use strict";

const { FetchFactory } = require("../../../utils/fetch-factory");
const { requestRapidApi } = require("../../../utils/rapidapi");
const { startsWithHttp, tmpFileNameFn } = require("./shared");

// async function maatootz({ url }) {
//   const apiName = "tiktok/maatootz";
//   // const dataResult = await requestFile(apiName, id);
//   const dataResult = await requestRapidApi(
//     "GET",
//     // "https://twitter135.p.rapidapi.com/v2/TweetDetail/",
//     "https://twitter135.p.rapidapi.com/v2/Tweet/",
//     {
//       host: "twitter135.p.rapidapi.com",
//       params: { url },
//     }
//   );

//   if (dataResult.isErr) return dataResult;

//   const { data, remaining, reset } = dataResult.value;
//   return await checkResult(parseGlavierTweet(data), apiName, id, data, remaining, reset);
// }

// https://rapidapi.com/maatootz/api/tiktok-full-info-without-watermark/
const fetchMaatootz = (url, { loadFromDisk = false, saveToDisk = false } = {}) => {};

const fetchSmth = FetchFactory("tiktok/maatootz", {
  async fetchFn(url) {
    const res = await requestRapidApi(
      "GET",
      "https://tiktok-full-info-without-watermark.p.rapidapi.com/vid/index",
      {
        host: "tiktok-full-info-without-watermark.p.rapidapi.com",
        params: { url },
        parseLimitsFn(response) {
          // console.log(response.headers);
          return {
            remaining: parseInt(
              response.headers["x-ratelimit-video-without-watermark-%2f-music-remaining"],
              10
            ),
            reset: parseInt(
              response.headers["x-ratelimit-video-without-watermark-%2f-music-reset"],
              10
            ),
          };
        },
      }
    );
    if (res.isErr) {
      throw res.error;
    }
    return res.value;
  },
  parseFn(data) {
    // if (data?.status === "success" && data.result) {
    //   return [data.result.video_hd, data.result.video1, data.result.video2].filter(startsWithHttp);
    // }
  },
  tmpFileNameFn,
});

module.exports = {
  fetchSmth,
};
