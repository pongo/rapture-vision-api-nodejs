import type { Balancer, BalancerOptions } from "../../utils/balancer.d.ts";
import type { TwitterApiFn, TwitterParams, TwitterResult } from "./apis/shared.d.ts";

export type TwitterBalancer = Balancer<TwitterResult, TwitterParams>;

export function createGetTwitter(
  balancer?: TwitterBalancer,
  balancerCallOptions?: Parameters<TwitterApiFn>[1],
): (id: string) => ReturnType<TwitterApiFn>;
