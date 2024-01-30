"use strict";

const ThreadsAPI = require("threads-api").ThreadsAPI;
const { Ok, Err } = require("../utils/result");
const axios = require("axios");
const writeJsonFile = require("write-json-file");
const fs = require("node:fs/promises");
const SimpleMemCache = require("../utils/simple-mem-cache").SimpleMemCache;

const cache = new SimpleMemCache();
const EXPIRE = 24 * 60 * 60 * 1000;

async function getThreads(url) {
  try {
    const cached = cache.get(url);
    if (cached) {
      console.log("cache found");
      return cached;
    }

    const result = await viaRocketCavsn(url);
    // const result = await viaThreadsAPI(url);
    if (result.isOk) cache.add(url, result, EXPIRE);

    return result;
  } catch (error) {
    return Err(`getThreads error: ${error.message}`, { error });
  }
}

async function viaThreadsAPI(url) {
  try {
    const threadsAPI = new ThreadsAPI();
    const postID = await threadsAPI.getPostIDfromURL(url);
    if (!postID) return Err(`PostId not found for "${url}"`);

    const data = await threadsAPI.getThreads(postID);
    const post = data.containing_thread.thread_items[0].post;
    return await checkResult(extractPost(post), "npm-threads-api", getWebId(url), data);
  } catch (error) {
    return Err(`[viaThreadsAPI] error: ${error.message}`, { error });
  }
}

function getWebId(url) {
  const regex = /https?:\/\/(?:www\.)?threads\.net\/t\/([A-Za-z0-9]+)/i;
  const match = url.match(regex);
  if (match) return match[1];
  else return undefined;
}

async function viaRocketCavsn(url) {
  const webId = getWebId(url);
  const options = {
    method: "GET",
    url: "https://threads-by-meta-threads-an-instagram-app-detailed.p.rapidapi.com/get_post_with_web_id",
    params: {
      web_id: webId,
    },
    headers: {
      "X-RapidAPI-Key": process.env.RAPID_API_KEY,
      "X-RapidAPI-Host": "threads-by-meta-threads-an-instagram-app-detailed.p.rapidapi.com",
    },
  };

  try {
    const data = (await axios.request(options)).data;
    // const data = JSON.parse(await fs.readFile("./tmp/threads/cavsn/CuWgZVFIu75.json", "utf-8"));
    return await checkResult(extractPost(data[0].post), "cavsn", webId, data);
  } catch (error) {
    return Err(`[viaRocketCavsn] error: ${error.message}`, { error });
  }
}

async function checkResult(result, apiName, webId, data) {
  const { caption, images, videos } = result;
  const success = caption !== "" || images.length > 0 || videos.length > 0;

  if (success) {
    await writeJsonFile(`./tmp/threads/${apiName}/${webId}.json`, data);
    return Ok(result);
  } else {
    await writeJsonFile(`./tmp/threads/${apiName}/${webId}-empty.json`, data);
    return Err(`[${apiName}] empty result`);
  }
}

function extractPost(post) {
  const caption = post?.caption?.text ?? "";
  const likes = post?.like_count ?? 0;
  const replies = post?.text_post_app_info?.direct_reply_count ?? 0;

  const videos = [];
  const images = [];

  if (post?.carousel_media != null && post.carousel_media.length > 0) {
    post.carousel_media.forEach(extractMedia);
  } else {
    extractMedia(post);
  }

  return { caption, likes, replies, videos, images };

  function extractMedia(obj) {
    if (obj.video_versions && obj.video_versions.length > 0) {
      videos.push(obj.video_versions[0].url);
      return;
    }

    if (obj.image_versions2 && obj.image_versions2?.candidates.length > 0) {
      images.push(obj.image_versions2.candidates[0].url);
    }
  }
}

module.exports = { getThreads, viaThreadsAPI, viaRocketCavsn };
