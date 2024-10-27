import axios from "axios";
import instagramGetUrl from "instagram-url-direct";
import { analytics } from "../../analytics/analytics.js";
import { Balancer } from "../../utils/balancer.js";
import { Err, Ok } from "../../utils/result.js";
import { apis } from "./apis/index.js";

const balancer = new Balancer({
  name: "instagram",
  apis,
  shuffle: true,
  strategy: "last",
  analytics,
});

export async function getInstagram(post_id) {
  try {
    return await balancer.callOneRound(post_id, { loadFromDisk: false });
  } catch (error) {
    return Err(`getInstagram error: ${error.message}`, { error, post_id });
  }
}

async function getInstagramGetUrl(url) {
  try {
    const links = await instagramGetUrl(url);
    const count = links?.url_list?.length ?? 0;
    if (count > 0) {
      return Ok(links.url_list);
    }
    return Err("instagramGetUrl Fetched 0 links");
  } catch (error) {
    return Err(`instagramGetUrl error: ${error.message}`, { error });
  }
}

// https://rapidapi.com/rocketapi/api/rocketapi-for-instagram
async function getRocketApi(post_id, story = false) {
  const route = story ? "get_info" : "get_info_by_shortcode";
  const data = story ? { id: post_id } : { shortcode: post_id };
  const options = {
    method: "POST",
    url: `https://rocketapi-for-instagram.p.rapidapi.com/instagram/media/${route}`,
    data: JSON.stringify(data),
    headers: {
      "X-RapidAPI-Key": process.env.RAPID_API_KEY,
      "X-RapidAPI-Host": "rocketapi-for-instagram.p.rapidapi.com",
      // "my-post-id": post_id,
    },
  };

  try {
    const data = (await axios.request(options)).data;
    const items = data?.response?.body?.items;
    if (items == null || items.length === 0) return Err("items is empty");
    const root = items[0];
    if (root?.carousel_media != null && root.carousel_media.length > 0) {
      return Ok(root.carousel_media.map(parseOne));
    } else {
      return Ok([parseOne(root)]);
    }
  } catch (error) {
    return Err(`getRocketApi error: ${error.message}`, { error });
  }

  function parseOne(obj) {
    if (obj.media_type === 1) return obj.image_versions2.candidates[0].url;
    if (obj.media_type === 2) return obj.video_versions[0].url;
    throw Error("unknown media_type: " + obj.media_type);
  }
}

export async function getInstagram_v1({ post_id, url }) {
  let result;

  if (post_id) {
    console.log(`getRocketApi(${post_id})`);
    result = await getRocketApi(post_id);
    if (result.isOk) {
      return result;
    }
  }

  if (url) {
    console.log("getInstagramGetUrl");
    result = await getInstagramGetUrl(url);
    if (result.isOk) {
      return result;
    }
  }

  return Err(`All instagram services failed`);
}

export async function getInstagramStory({ id, url }) {
  let result;

  if (id) {
    console.log(`getRocketApiStory(${id})`);
    result = await getRocketApi(id, true);
    if (result.isOk) {
      return result;
    }
  }

  return Err(`All instagram_story services failed`);
}
