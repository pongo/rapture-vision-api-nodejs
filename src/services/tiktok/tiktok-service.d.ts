import type { Balancer, BalancerOptions } from "../../utils/balancer.d.ts";
import type { TiktokApiFn, TiktokParams, TiktokResult } from "./apis/shared.d.ts";

export type TiktokBalancer = Balancer<TiktokResult, TiktokParams>;

export function createGetTiktok(
  balancer?: Tiktok,
  balancerCallOptions?: Parameters<TiktokApiFn>[1],
): (url: string) => ReturnType<TiktokApiFn>;
