"use strict";

const delay = require("node:timers/promises").setTimeout;
const { requestRapidApi } = require("../../../utils/rapidapi");
const {
  TwitterFactory,
  parseThreadedConversationV2,
  parseGlavierTweet,
  parseDavethebeast241,
  parseAbcdsxg1TweetResultByRestId,
} = require("./shared");

// https://rapidapi.com/omarmhaimdat/api/twitter-v24/
const fetchOmarmhaimdat24 = TwitterFactory("twitter/omarmhaimdat24", {
  async fetchFn(id) {
    return await requestRapidApi("GET", "https://twitter-v24.p.rapidapi.com/tweet/details", {
      host: "twitter-v24.p.rapidapi.com",
      params: { tweet_id: id },
    });
  },
  parseFn({ remaining, reset, data }, id) {
    return { ...parseThreadedConversationV2(id, data.data), remaining, reset };
  },
});

// https://rapidapi.com/Glavier/api/twitter135
const fetchGlavier135TweetDetail = TwitterFactory("twitter/Glavier135/TweetDetail", {
  async fetchFn(id) {
    return await requestRapidApi("GET", "https://twitter135.p.rapidapi.com/v2/TweetDetail/", {
      host: "twitter135.p.rapidapi.com",
      params: { id },
    });
  },
  parseFn({ remaining, reset, data }, id) {
    return { ...parseThreadedConversationV2(id, data.data), remaining, reset };
  },
});

// https://rapidapi.com/Glavier/api/twitter135
const fetchGlavier135Tweet = TwitterFactory("twitter/Glavier135/Tweet", {
  async fetchFn(id) {
    return await requestRapidApi("GET", "https://twitter135.p.rapidapi.com/v2/Tweet/", {
      host: "twitter135.p.rapidapi.com",
      params: { id },
    });
  },
  parseFn({ remaining, reset, data }) {
    return { ...parseGlavierTweet(data), remaining, reset };
  },
});

// https://rapidapi.com/davethebeast/api/twitter241
const fetchDavethebeast241 = TwitterFactory("twitter/davethebeast241", {
  async fetchFn(id) {
    return await requestRapidApi("GET", "https://twitter241.p.rapidapi.com/tweet", {
      host: "twitter241.p.rapidapi.com",
      params: { pid: id },
    });
  },
  async parseFn({ remaining, reset, data }, id, options) {
    const orig = parseDavethebeast241(data, id);

    if (orig.quote_id && options.loadQuote !== false) {
      if (!options.loadFromDisk) await delay(1000);
      const quotedResult = await fetchDavethebeast241(orig.quote_id, {
        ...options,
        loadQuote: false,
      });
      if (quotedResult.isOk) {
        return {
          text: orig.text,
          images: [...orig.images, ...quotedResult.value.images],
          videos: [...orig.videos, ...quotedResult.value.videos],
          remaining,
          reset,
        };
      }
    }

    return { ...orig, remaining, reset };
  },
});

// https://rapidapi.com/abcdsxg/api/twitter-v1-1-v2-api
const fetchAbcdsxg1TweetResultByRestId = TwitterFactory("twitter/abcdsxg1/TweetResultByRestId", {
  async fetchFn(id) {
    return await requestRapidApi(
      "GET",
      "https://twitter-v1-1-v2-api.p.rapidapi.com/graphql/TweetResultByRestId",
      {
        host: "twitter-v1-1-v2-api.p.rapidapi.com",
        params: {
          variables: JSON.stringify({
            tweetId: id,
            withHighlightedLabel: true,
            withTweetQuoteCount: true,
            includePromotedContent: true,
            withBirdwatchPivots: true,
            withVoice: true,
            withReactions: true,
          }),
        },
      },
    );
  },
  parseFn({ remaining, reset, data }, id) {
    return { ...parseAbcdsxg1TweetResultByRestId(data, id), remaining, reset };
  },
});

// https://rapidapi.com/restocked-gAGxip8a_/api/twitter-api47
const fetchRestocked47 = TwitterFactory("twitter/restocked47", {
  async fetchFn(id) {
    return await requestRapidApi("GET", "https://twitter-api47.p.rapidapi.com/v1/tweet-details", {
      host: "twitter-api47.p.rapidapi.com",
      params: { tweetId: id },
    });
  },
  parseFn({ remaining, reset, data }, id) {
    return { ...parseThreadedConversationV2(id, data), remaining, reset };
  },
});

// const fetchSmth = TwitterFactory("twitter/restocked47", {
//   async fetchFn(id) {
//     return await requestRapidApi("GET", "https://twitter-api47.p.rapidapi.com/v1/tweet-details", {
//       host: "twitter-api47.p.rapidapi.com",
//       params: { tweetId: id },
//       parseLimitsFn(response) {
//         console.log(response.headers);
//         console.log(
//           response.headers["x-ratelimit-requests-remaining"],
//           response.headers["x-ratelimit-requests-reset"],
//         );
//         return {
//           remaining: parseInt(response.headers["x-ratelimit-requests-remaining"], 10),
//           reset: parseInt(response.headers["x-ratelimit-requests-reset"], 10),
//         };
//       },
//     });
//   },
//   parseFn({ remaining, reset, data }, id) {
//     // const videos = [data?.details?.download_url].filter(startsWithHttp);
//     // return { videos, remaining, reset };
//   },
// });

module.exports = {
  // fetchSmth,
  fetchOmarmhaimdat24,
  fetchGlavier135TweetDetail,
  // fetchGlavier135Tweet,
  fetchDavethebeast241,
  fetchAbcdsxg1TweetResultByRestId,
  fetchRestocked47,
};
