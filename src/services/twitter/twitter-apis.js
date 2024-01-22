"use strict";

require("dotenv").config();
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
    }
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
    }
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

module.exports = { apis, parseConversation, parseGlavierTweet, viaGlavier };
