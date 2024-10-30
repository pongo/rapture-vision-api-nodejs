import { analytics } from "../../analytics/analytics.js";
import { Balancer } from "../../utils/balancer.js";
import { Err } from "../../utils/result.js";
import { apis } from "./apis/index.js";

const balancer = new Balancer({
  name: "twitter",
  apis,
  shuffle: true,
  strategy: "last",
  analytics,
});

export async function getTwitter(id) {
  try {
    return await balancer.callOneRound(id, { loadFromDisk: false });
  } catch (error) {
    return Err(`getTwitter error: ${error.message}`, { error });
  }
}
