import { analytics } from "../../analytics/analytics.js";
import { Balancer } from "../../utils/balancer.js";
import { Err } from "../../utils/result.js";
import { apis } from "./apis/index.js";

const balancer = new Balancer({ name: "tiktok", apis, shuffle: true, strategy: "last", analytics });

export async function getTiktok(url) {
  try {
    return await balancer.callOneRound(url, { loadFromDisk: false });
  } catch (error) {
    return Err(`getTiktok error: ${error.message}`, { error, url });
  }
}
