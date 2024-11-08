import type { ApiFn } from "../../../utils/balancer.d.ts";
import type { FactoryOptions, FetchFnParameters } from "../../../utils/fetch-factory.d.ts";

type Limits = {
  reset?: number;
  remaining?: number;
};

export type InstagramResult = { images: string[]; videos: string[] } & Limits;

export function urlFromId(id: string): string;

export function splitUrls(urls: string[]): { images: string[]; videos: string[] };

export type InstagramParams = FetchFnParameters<InstagramResult>;
export type InstagramApiFn = ApiFn<InstagramResult, InstagramParams>;

export function InstagramFactory<F>(
  apiName: string,
  factoryOptions: FactoryOptions<InstagramResult, F>,
): InstagramApiFn;

export type InstagramApis = Array<[string, InstagramApiFn]>;
