import type { ApiFn } from "../../../utils/balancer.d.ts";
import type { FactoryOptions, FetchFnParameters } from "../../../utils/fetch-factory.d.ts";

type Limits = {
  reset?: number;
  remaining?: number;
};

export type TiktokResult = { videos: string[] } & Limits;

export type TiktokParams = FetchFnParameters<TiktokResult>;
export type TiktokApiFn = ApiFn<TiktokResult, TiktokParams>;

export function TiktokFactory<F>(
  apiName: string,
  factoryOptions: FactoryOptions<TiktokResult, F>,
): TiktokApiFn;

export type TiktokApis = Array<[string, TiktokApiFn]>;

export function tmpFileNameFn(videoUrl: string): string;
export function assertLongUrl(url: string): boolean;
export function assertId(url: string): boolean;
