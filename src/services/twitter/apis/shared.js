"use strict";

const { FetchFactory } = require("../../../utils/fetch-factory");
const { startsWithHttp } = require("../../../utils/api-utils");

function tmpFileNameFn(id) {
  return id;
}

function isTrue(x) {
  return x === true;
}

function checkFn({ text, images, videos }) {
  return [text !== "", checkUrlsArray(images), checkUrlsArray(videos)].every(isTrue);
}

function checkUrlsArray(urls) {
  if (!Array.isArray(urls)) return false;
  if (urls.length === 0) return true;
  if (Array.isArray(urls[0])) return urls.map(checkUrlsArray).every(isTrue);
  return urls.filter(startsWithHttp).length > 0;
}

function parseThreadedConversationV2(tweet_id, data) {
  const result1 = getResult1(data);
  const post = getPost(result1);
  const text = post?.full_text ?? "";
  const mediaDetails = getMedia(result1, post);
  const images = getImages(mediaDetails);
  const videos = getVideos(mediaDetails);

  return { text, images, videos };

  function getMedia(result, post) {
    let quotedMedia = [];
    if ("quoted_status_result" in result) {
      const quotedPost = getPost(result.quoted_status_result.result);
      quotedMedia = quotedPost?.extended_entities?.media ?? [];
    }
    const originalMedia = post?.extended_entities?.media ?? [];
    return [...originalMedia, ...quotedMedia];
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

function getImages(mediaDetails) {
  return mediaDetails.filter((m) => m.type === "photo").map((m) => m.media_url_https);
}

function getVideos(mediaDetails) {
  return mediaDetails
    .filter((m) => m.type !== "photo")
    .map((m) => m.video_info.variants.filter((variant) => variant.content_type.includes("video")))
    .map((variants) => variants.sort((a, b) => b.bitrate - a.bitrate)) // от большего к меньшему
    .map((variants) => variants.map((variant) => variant.url));
}

function parseGlavierTweet(data) {
  const text = data?.text ?? "";
  const quotedMedia = data?.quoted_tweet?.mediaDetails ?? [];
  const origMedia = data?.mediaDetails ?? [];
  const mediaDetails = [...origMedia, ...quotedMedia];
  const images = getImages(mediaDetails);
  const videos = getVideos(mediaDetails);

  return { text, images, videos };
}

function parseDavethebeast241(data, id) {
  if (data.data && "threaded_conversation_with_injections_v2" in data.data) {
    return parseThreadedConversationV2(id, data.data);
  }

  const post = data.tweet;
  const text = post?.full_text ?? "";
  const media = post?.extended_entities?.media ?? [];
  const images = getImages(media);
  const videos = getVideos(media);

  const quote_id = post?.is_quote_status ? post.quoted_status_id_str : undefined;
  return { text, images, videos, quote_id };
}

function parseAbcdsxg1TweetResultByRestId(data, id) {
  const result = data.data.tweetResult.result;
  const post = result.legacy;
  const text = post.full_text ?? "";

  const quotedPost = result?.quoted_status_result?.result?.legacy;
  const quotedMedia = quotedPost?.extended_entities?.media ?? [];
  const origMedia = post?.extended_entities?.media ?? [];
  const mediaDetails = [...origMedia, ...quotedMedia];
  const images = getImages(mediaDetails);
  const videos = getVideos(mediaDetails);

  return { text, images, videos };
}

function TwitterFactory(apiName, options) {
  return FetchFactory(apiName, { checkFn, tmpFileNameFn, ...options });
}

module.exports = {
  parseThreadedConversationV2,
  parseGlavierTweet,
  parseDavethebeast241,
  parseAbcdsxg1TweetResultByRestId,
  TwitterFactory,
};
