import { FetchFnParameters, FactoryOptions } from "../../../utils/fetch-factory";
import { ApiFn } from "../../../utils/balancer";

type Limits = {
  reset?: number;
  remaining?: number;
};

type InstagramResult = { images: string[]; videos: string[] } & Limits;

export function urlFromId(id: string): string;

export function splitUrls(urls: string[]): { images: string[]; videos: string[] };

type InstagramApiFn = ApiFn<InstagramResult, FetchFnParameters<InstagramResult>>;

export function InstagramFactory<F>(
  apiName: string,
  factoryOptions: FactoryOptions<InstagramResult, F>,
): InstagramApiFn;

export type InstagramApis = Array<[string, InstagramApiFn]>;
