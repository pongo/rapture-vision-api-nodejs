import type { Balancer, BalancerOptions } from "../../utils/balancer.d.ts";
import type { InstagramApiFn, InstagramParams, InstagramResult } from "./apis/shared.d.ts";

export type InstagramBalancer = Balancer<InstagramResult, InstagramParams>;

export function createGetInstagram(
  balancer?: InstagramBalancer,
  balancerCallOptions?: Parameters<InstagramApiFn>[1],
): (post_id: string) => ReturnType<InstagramApiFn>;
