"use strict";

const { Err } = require("../../utils/result");
const { checkResult, requestFile } = require("./utils");
const { requestRapidApi } = require("./rapid-api");

/**
 * @type {Array<[string, function({id: string})]>}
 */
const apis = [
  // ["fail", async ({ id }) => Err("Fail", { remaining: 100, reset: 1 })],
  ["Glavier", viaGlavier],
  ["restocked", viaRestocked],
];

async function viaGlavier({ id }) {
  const apiName = "Glavier/Tweet";
  // const dataResult = await requestFile(apiName, id);
  const dataResult = await requestRapidApi(
    "GET",
    // "https://twitter135.p.rapidapi.com/v2/TweetDetail/",
    "https://twitter135.p.rapidapi.com/v2/Tweet/",
    {
      host: "twitter135.p.rapidapi.com",
      params: { id },
    },
  );

  if (dataResult.isErr) return dataResult;

  const { data, remaining, reset } = dataResult.value;
  return await checkResult(parseGlavierTweet(data), apiName, id, data, remaining, reset);
}

async function viaRestocked({ id }) {
  const apiName = "restocked/tweet-details";
  // const dataResult = await requestFile(apiName, id);
  const dataResult = await requestRapidApi(
    "GET",
    "https://twitter-api47.p.rapidapi.com/v1/tweet-details",
    {
      host: "twitter-api47.p.rapidapi.com",
      params: { tweetId: id },
    },
  );
  if (dataResult.isErr) return dataResult;

  const { data, remaining, reset } = dataResult.value;
  return await checkResult(parseConversation(id, data), apiName, id, data, remaining, reset);
}

function parseGlavierTweet(data) {
  const text = data?.text ?? "";
  const mediaDetails = data?.mediaDetails ?? data?.quoted_tweet?.mediaDetails ?? [];
  const images = getImages(mediaDetails);
  const videos = getVideos(mediaDetails);

  return { text, images, videos };
}

function getImages(mediaDetails) {
  return mediaDetails.filter((m) => m.type === "photo").map((m) => m.media_url_https);
}

function getVideos(mediaDetails) {
  return mediaDetails
    .filter((m) => m.type !== "photo")
    .map((m) => m.video_info.variants.filter((variant) => variant.content_type === "video/mp4"))
    .map((variants) => variants.sort((a, b) => b.bitrate - a.bitrate)) // от большего к меньшему
    .map((variants) => variants.map((variant) => variant.url));
}

function parseConversation(tweet_id, data) {
  const result1 = getResult1(data);
  const post = getPost(result1);
  const text = post?.full_text ?? "";
  const mediaDetails = getMedia(result1, post);
  const images = getImages(mediaDetails);
  const videos = getVideos(mediaDetails);

  return { text, images, videos };

  function getMedia(result, post) {
    if ("quoted_status_result" in result) {
      const quotedPost = getPost(result.quoted_status_result.result);
      const quotedMedia = quotedPost?.extended_entities?.media ?? [];
      if (quotedMedia.length > 0) return quotedMedia;
    }
    return post?.extended_entities?.media ?? [];
  }

  function getResult1(data) {
    const entries = getEntries(data);
    for (const entry of entries) {
      if (entry.entryId !== `tweet-${tweet_id}`) {
        continue;
      }
      const result = entry?.content?.itemContent?.tweet_results?.result;
      if ("legacy" in result) return result;
      if ("tweet" in result && "legacy" in result.tweet) return result;
    }
    return undefined;
  }

  function getPost(result) {
    if ("legacy" in result) return result.legacy;
    if ("tweet" in result && "legacy" in result.tweet) return result.tweet.legacy;
    return undefined;
  }

  function getEntries(data) {
    if ("entries" in data) {
      return data.entries;
    }
    if ("threaded_conversation_with_injections_v2" in data) {
      return data.threaded_conversation_with_injections_v2?.instructions?.at(0)?.entries;
    }
    // data['data']['threaded_conversation_with_injections']['instructions'][0]['entries']
    return undefined;
  }
}

if (process.env.NODE_ENV === "test" && require.main === module) {
  const assert = require("node:assert/strict");
  const { describe, it } = require("node:test");
  const { loadJson } = require("../../../test/utils");

  const tweets = {
    // long text.
    // https://twitter.com/TwitterSupport/status/1679529814212894723
    "1679529814212894723": {
      text: "Starting as soon as July 14th, we’re adding a new messages setting that should help reduce the number of spam messages in DMs. With the new setting enabled, messages from users who you follow will arrive in your primary inbox, and messages from verified users who you don’t follow…",
      images: [],
      videos: [],
    },

    // 1 image.
    // https://twitter.com/peterbyrzhenka/status/1677672844803682307
    "1677672844803682307": {
      text: "внимание\n\nнаша ключница\n\nспасибо за внимание https://t.co/AEdt2Yfswy",
      images: ["https://pbs.twimg.com/media/F0hKjm0WwAEWB5n.jpg"],
      videos: [],
    },

    // 2 images.
    // https://twitter.com/hungryfishxuan/status/1679584086577549312
    "1679584086577549312": {
      text: "Это могли бы быть мы, но слава архонтам, нет, потому что с луком в качестве оружия я бы бросила геншин в первый же день игры https://t.co/ynKzkd88uN",
      images: [
        "https://pbs.twimg.com/media/F08U0o4WcAAyUKN.jpg",
        "https://pbs.twimg.com/media/F08U0ygWIAIPdBq.jpg",
      ],
      videos: [],
    },

    // gif.
    // https://twitter.com/TheOtaking/status/1637200370207281152
    "1637200370207281152": {
      text: "The King of Fighters XIII - SNK Playmore - Arcade - 2010\n\nhttps://t.co/tRVVQfFvcA",
      images: [],
      videos: [["https://video.twimg.com/tweet_video/DMAIT_WVwAAwzWl.mp4"]],
    },

    // video + image.
    // https://twitter.com/Royals/status/1564019746521202693
    "1564019746521202693": {
      text: "The only way to cool us down today.\n\n#TogetherRoyal https://t.co/YoKIZygDb1",
      images: ["https://pbs.twimg.com/media/FbSDoQQWYAY-Mm5.jpg"],
      videos: [
        [
          "https://video.twimg.com/ext_tw_video/1564019698181840903/pu/vid/720x900/amEgyF6qV50fdTwN.mp4?tag=12",
          "https://video.twimg.com/ext_tw_video/1564019698181840903/pu/vid/480x600/ZTU99CCA3-kxrNxJ.mp4?tag=12",
          "https://video.twimg.com/ext_tw_video/1564019698181840903/pu/vid/320x400/IJKTztFE_TAfb0I7.mp4?tag=12",
        ],
      ],
    },

    // некорневое gif + image. with alts.
    // https://twitter.com/TwitterSupport/status/1577730112853680128
    "1577730112853680128": {
      text: "Create a whole vibe https://t.co/BDFnwC0pn9",
      images: ["https://pbs.twimg.com/media/FeU5Kx8UcAE7qcB.jpg"],
      videos: [["https://video.twimg.com/tweet_video/FeU5Kx9UYAEa_Fm.mp4"]],
    },

    // 4 videos. https://twitter.com/jasmin_herrero/status/1676700862935072769
    "1676700862935072769": {
      text: '💚💜 JINKOOK 💜💚\n"When JUNGKOOK marking his territory-1 😝😛😝😁😁✌️✌️"\n#jinkook #kookjin\n#jinkook_my_everything \n#kookjin_my_everything \n videos ctto https://t.co/bCR2DLWKtX',
      images: [],
      videos: [
        [
          "https://video.twimg.com/ext_tw_video/1676700690196955136/pu/vid/1080x602/8UEPWpQ0DijdURCl.mp4?tag=12",
          "https://video.twimg.com/ext_tw_video/1676700690196955136/pu/vid/644x360/x7T8p0te9b7O85Tt.mp4?tag=12",
          "https://video.twimg.com/ext_tw_video/1676700690196955136/pu/vid/484x270/zwZTI6mbxUOX5LuY.mp4?tag=12",
        ],
        [
          "https://video.twimg.com/ext_tw_video/1676700742785040384/pu/vid/1080x604/HJPHrowsDe_HrI6u.mp4?tag=12",
          "https://video.twimg.com/ext_tw_video/1676700742785040384/pu/vid/642x360/BWIyFtgr54T-Uf7V.mp4?tag=12",
          "https://video.twimg.com/ext_tw_video/1676700742785040384/pu/vid/482x270/5An0qxWtmSmkxvkn.mp4?tag=12",
        ],
        [
          "https://video.twimg.com/ext_tw_video/1676700799143931904/pu/vid/368x656/b2fqqgwYSmVy2Iig.mp4?tag=12",
          "https://video.twimg.com/ext_tw_video/1676700799143931904/pu/vid/320x570/HDZBzxSvIUp8uWZl.mp4?tag=12",
        ],
        [
          "https://video.twimg.com/ext_tw_video/1676700824754429957/pu/vid/720x838/znJxgmnezYRjhdBW.mp4?tag=12",
          "https://video.twimg.com/ext_tw_video/1676700824754429957/pu/vid/480x558/QNgQM1qmdeMnf84J.mp4?tag=12",
          "https://video.twimg.com/ext_tw_video/1676700824754429957/pu/vid/320x372/l43R_RXcD-ialmeP.mp4?tag=12",
        ],
      ],
    },

    // quoted video. https://twitter.com/dm7mnn/status/1687020757249822721
    "1687020757249822721": {
      text: "пов: ты сидишь в баре хроники и арсений бабушкин приносит тебе очередную стопку кизлярки",
      images: [],
      videos: [
        [
          "https://video.twimg.com/ext_tw_video/1685986657642618880/pu/vid/606x1080/ykhraq8BxNEnPPQu.mp4?tag=12",
          "https://video.twimg.com/ext_tw_video/1685986657642618880/pu/vid/480x854/jbzl5K3orS_6oXZQ.mp4?tag=12",
          "https://video.twimg.com/ext_tw_video/1685986657642618880/pu/vid/320x570/hLnVjjrtkrkCEiuV.mp4?tag=12",
        ],
      ],
    },
  };

  for (const [id, expected] of Object.entries(tweets)) {
    describe(id, { concurrency: true }, () => {
      it("parseGlavierTweet", async () => {
        assert.deepEqual(
          parseGlavierTweet(await loadJson(`./tmp/twitter/Glavier/Tweet/${id}.json`)),
          expected,
        );
      });

      it("parseConversation", async () => {
        assert.deepEqual(
          parseConversation(id, await loadJson(`./tmp/twitter/restocked/tweet-details/${id}.json`)),
          expected,
        );
      });
    });
  }
}

module.exports = { apis, viaGlavier };
