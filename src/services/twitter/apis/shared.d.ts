import { FetchFnParameters, FactoryOptions } from "../../../utils/fetch-factory";
import { ApiFn } from "../../../utils/balancer";

type Limits = {
  reset?: number;
  remaining?: number;
};

type TwitterResultBase = { text: string; images: string[]; videos: string[] };
type TwitterResult = TwitterResultBase & Limits;

type TwitterApiFn = ApiFn<TwitterResult, FetchFnParameters<TwitterResult>>;

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
