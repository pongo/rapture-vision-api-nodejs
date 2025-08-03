import type { ApiFn } from "../../../utils/balancer.d.ts";
import type { FactoryOptions, FetchFnParameters } from "../../../utils/fetch-factory.d.ts";

type Limits = {
  reset?: number;
  remaining?: number;
};

type TwitterResultBase = { text: string; images: string[]; videos: string[] };
export type TwitterResult = TwitterResultBase & Limits;

export type TwitterParams = FetchFnParameters<TwitterResult>;
export type TwitterApiFn = ApiFn<TwitterResult, TwitterParams>;

export function TwitterFactory<F>(
  apiName: string,
  factoryOptions: FactoryOptions<TwitterResult, F, { loadQuote?: boolean }>,
): TwitterApiFn;

export type TwitterApis = Array<[string, TwitterApiFn]>;

export function parseThreadedConversationV2(tweet_id: string, data: object): TwitterResultBase;
export function parseGlavierTweet(data: object): TwitterResultBase;
export function parseAbcdsxg1TweetResultByRestId(data: object, id: string): TwitterResultBase;
export function parseDavethebeast241(
  data: object,
  id: string,
): TwitterResultBase & { quote_id: string };
