// https://github.com/milancodess/universalDownloader/tree/main

import axios from "axios";
import { parseTiktokUrl } from "../services/tiktok/parse-tiktok-url.js";
import * as cheerio from "cheerio";

export async function tiktok(url) {
  const parsed = parseTiktokUrl(url);
  const videoId = parsed.id || parsed.shortcode;
  const apiUrl = `https://api.twitterpicker.com/tiktok/mediav2?id=${videoId}`;

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        priority: "u=1, i",
        "sec-ch-ua": '"Not)A;Brand";v="8", "Chromium";v="138", "Brave";v="138"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "sec-gpc": "1",
        Referer: "https://tiktokdownloader.com/",
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(`TikTok API request failed: ${error.message}`);
  }
}

export async function threads(url) {
  try {
    const res = await axios.post(
      "https://threadsv.com/get-thr",
      {
        token: "29ae809a4f98ebee39d8d683f851fc86",
        url,
        lang: "en",
      },
      {
        headers: {
          "content-type": "application/json",
          referer: "https://threadsv.com/",
          "user-agent": "Mozilla/5.0",
          cookie: "PHPSESSID=l7cec5kqiqlt2mce3q03in0jo9",
        },
      },
    );

    if (!res.data || !res.data.html) {
      throw new Error("No HTML in response from threadsv.com");
    }

    // writeFileSync("threads.html", res.data.html);
    const $ = cheerio.load(res.data.html);
    // const $ = cheerio.load(readFileSync("threads.html", "utf8"));
    const images = [];
    const videos = [];
    $(".btn.download-btn").each(function () {
      const $this = $(this);
      const label = $this.data("label");
      if (label === "downloaded media image") {
        images.push($this.attr("href"));
      } else if (label === "downloaded media video") {
        videos.push($this.attr("href"));
      }
    });

    return { images, videos };
  } catch (error) {
    throw new Error(error.message);
  }
}
