import assert from "node:assert/strict";
import { analytics } from "../../analytics/analytics.js";
import { Balancer } from "../../utils/balancer.js";
import { Err } from "../../utils/result.js";
import { apis } from "./apis/index.js";

const defaultBalancer = new Balancer({
  name: "threads",
  apis,
  shuffle: true,
  strategy: "last",
  analytics,
});

export function createGetThreads(balancer = undefined, balancerCallOptions = undefined) {
  const _balancer = balancer ?? defaultBalancer;
  return async (url) => {
    assert(typeof url === "string", url);

    try {
      return await _balancer.callOneRound(url, { loadFromDisk: false, ...balancerCallOptions });
    } catch (error) {
      return Err(`getThreads error: ${error.message}`, { error });
    }
  };
}
