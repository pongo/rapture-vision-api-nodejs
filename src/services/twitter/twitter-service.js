import assert from "node:assert/strict";
import { analytics } from "../../analytics/analytics.js";
import { Balancer } from "../../utils/balancer.js";
import { Err } from "../../utils/result.js";
import { apis } from "./apis/index.js";

/** @type {import("./twitter-service.d.ts").TwitterBalancer} */
const defaultBalancer = new Balancer({
  name: "twitter",
  apis,
  shuffle: true,
  strategy: "last",
  analytics,
});

/** @type {import("./twitter-service.d.ts").createGetTwitter} */
export function createGetTwitter(balancer = undefined, balancerCallOptions = undefined) {
  /** @type {import("./twitter-service.d.ts").TwitterBalancer} */
  const _balancer = balancer ?? defaultBalancer;
  return async (id) => {
    assert(typeof id === "string", id);

    try {
      return await _balancer.callOneRound(id, { loadFromDisk: false, ...balancerCallOptions });
    } catch (error) {
      return Err(`getTwitter error: ${error.message}`, { error });
    }
  };
}
