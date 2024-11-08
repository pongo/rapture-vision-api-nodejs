import assert from "node:assert/strict";
import { analytics } from "../../analytics/analytics.js";
import { Balancer } from "../../utils/balancer.js";
import { Err } from "../../utils/result.js";
import { apis } from "./apis/index.js";

/** @type {import("./tiktok-service.d.ts").TiktokBalancer} */
const defaultBalancer = new Balancer({
  name: "tiktok",
  apis,
  shuffle: true,
  strategy: "last",
  analytics,
});

/** @type {import("./tiktok-service.d.ts").createGetTiktok} */
export function createGetTiktok(balancer = undefined, balancerCallOptions = undefined) {
  /** @type {import("./tiktok-service.d.ts").TiktokBalancer} */
  const _balancer = balancer ?? defaultBalancer;
  return async (url) => {
    assert(typeof url === "string", url);

    try {
      return await _balancer.callOneRound(url, { loadFromDisk: false, ...balancerCallOptions });
    } catch (error) {
      return Err(`getTiktok error: ${error.message}`, { error, url });
    }
  };
}
