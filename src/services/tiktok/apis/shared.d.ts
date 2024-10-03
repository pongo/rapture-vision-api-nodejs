import { FetchFnParameters, FactoryOptions } from "../../../utils/fetch-factory";
import { ApiFn } from "../../../utils/balancer";

type Limits = {
  reset?: number;
  remaining?: number;
};

type TiktokResult = { videos: string[] } & Limits;

type TiktokApiFn = ApiFn<TiktokResult, FetchFnParameters<TiktokResult>>;

export function TiktokFactory<F>(
  apiName: string,
  factoryOptions: FactoryOptions<TiktokResult, F>,
): TiktokApiFn;

export type TiktokApis = Array<[string, TiktokApiFn]>;

export function tmpFileNameFn(videoUrl: string): string;
export function assertLongUrl(url: string): boolean;
export function assertId(url: string): boolean;
