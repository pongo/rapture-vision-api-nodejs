import { FetchFn, FactoryOptions } from "../../../utils/fetch-factory";

type Limits = {
  reset?: number;
  remaining?: number;
};

type InstagramResult = { images: string[]; videos: string[] } & Limits;

export function urlFromId(id: string): string;

export function splitUrls(urls: string[]): { images: string[]; videos: string[] };

// export function InstagramFactory(
//   apiName: string,
//   options: FactoryOptions<InstagramResult>,
// ): FetchFn<InstagramResult>;

export function InstagramFactory<F>(
  apiName: string,
  factoryOptions: FactoryOptions<InstagramResult, F>,
): FetchFn<InstagramResult>;
