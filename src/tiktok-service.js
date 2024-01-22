"use strict";

const { Err } = require("./utils/result");
const { Ok } = require("./utils/result");
const TikTokScraper = require("tiktok-scraper");
const phaticusthiccy = require("@phaticusthiccy/open-apis");
const SMD = require("social_media_downloader");
const tiklydown = require("node-tiklydown").v1;
const TikChan = require("tikchan");
const axios = require("axios");

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function tryGetVideoMeta(videoUrl, useProxy = false, proxy = "") {
  try {
    return Ok(
      await TikTokScraper.getVideoMeta(videoUrl, {
        sessionList: [`sid_tt=${process.env.TIKTOK_SID_TT};`],
        strictSSL: false,
        verifyFp: process.env.TIKTOK_VERIFYFP,
        proxy: useProxy ? proxy : "",
      })
    );
  } catch (e) {
    //console.error(e);
    return Err(); //`${e}`);
  }
}

async function fetchphaticusthiccy(videoUrl) {
  try {
    const data = await phaticusthiccy.tiktok(videoUrl);
    if (data.status && data.server1) {
      return Ok({ collector: [{ videoUrl: data.server1.video }] });
    }
  } catch (e) {
    //console.error(e);
    return Err();
  }
  return Err();
}

async function fetchSMD(videoUrl) {
  try {
    const data = await SMD.tiktok(videoUrl);
    if (data.success && data.link) {
      return Ok({ collector: [{ videoUrl: data.link }] });
    }
  } catch (e) {
    //console.error(e);
    return Err();
  }
  return Err();
}

async function fetchTiklydown(videoUrl) {
  try {
    const data = await tiklydown(videoUrl);
    const video = data?.video?.noWatermark || data?.video?.watermark;
    if (video) {
      return Ok({ collector: [{ videoUrl: video }] });
    }
  } catch (e) {
    //console.error(e);
    return Err();
  }
  return Err();
}

async function fetchTikChan(videoUrl) {
  try {
    const data = await TikChan.download(videoUrl);
    const video = data?.no_wm || data?.wm;
    if (video) {
      return Ok({ collector: [{ videoUrl: video }] });
    }
  } catch (e) {
    //console.error(e);
    return Err();
  }
  return Err();
}

// https://rapidapi.com/TerminalWarlord/api/tiktok-info/
async function fetchTikTokInfo(videoUrl) {
  const options = {
    method: "GET",
    url: "https://tiktok-info.p.rapidapi.com/dl/",
    params: { link: videoUrl },
    headers: {
      "X-RapidAPI-Key": process.env.RAPID_API_KEY,
      "X-RapidAPI-Host": "tiktok-info.p.rapidapi.com",
    },
  };

  try {
    const data = (await axios.request(options)).data;
    const video = data?.videoLinks?.download;
    if (video) {
      return Ok({ collector: [{ videoUrl: video }] });
    }
  } catch (e) {
    // console.error(e);
    return Err();
  }
  return Err();
}

// https://rapidapi.com/mirzahadjaevaguzal/api/tiktok-downloader-download-videos-without-watermark1
async function fetchTikTokMirzahadjaeva(videoUrl) {
  const options = {
    method: "GET",
    url: "https://tiktok-downloader-download-videos-without-watermark1.p.rapidapi.com/media-info/",
    params: { link: videoUrl },
    headers: {
      "X-RapidAPI-Key": process.env.RAPID_API_KEY,
      "X-RapidAPI-Host": "tiktok-downloader-download-videos-without-watermark1.p.rapidapi.com",
    },
  };

  try {
    const data = (await axios.request(options)).data;
    const videos = data?.result?.video?.url_list;
    if (videos && videos.length > 0) {
      return Ok({ collector: [{ videoUrl: videos[0] }] });
    }
  } catch (e) {
    // console.error(e);
    return Err();
  }
  return Err();
}

async function getTiktokVideoMeta(videoUrl) {
  let result;

  console.log("fetchTiklydown");
  result = await fetchTiklydown(videoUrl);
  if (result.isOk) {
    return result;
  }

  console.log("fetchSMD");
  result = await fetchSMD(videoUrl);
  if (result.isOk) {
    return result;
  }

  console.log("tryGetVideoMeta (no proxy)");
  result = await tryGetVideoMeta(videoUrl, false);
  if (result.isOk) {
    return result;
  }

  console.log("fetchphaticusthiccy");
  result = await fetchphaticusthiccy(videoUrl);
  if (result.isOk) {
    return result;
  }

  console.log("fetchTikTokInfo");
  result = await fetchTikTokInfo(videoUrl);
  if (result.isOk) {
    return result;
  }
  
  console.log("fetchTikTokMirzahadjaeva");
  result = await fetchTikTokMirzahadjaeva(videoUrl);
  if (result.isOk) {
    return result;
  }

  // в конце, т.к. я не уверен в этом варианте
  console.log("fetchTikChan");
  result = await fetchTikChan(videoUrl);
  if (result.isOk) {
    return result;
  }

  return Err("All apis failed");
}

module.exports = { getTiktokVideoMeta };
