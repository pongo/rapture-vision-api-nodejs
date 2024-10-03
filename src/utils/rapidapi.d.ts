import { Result } from "./result";

type Limits = {
  reset: number;
  remaining: number;
};

type RapidApiResponse = Result<{ data?: any } & Limits>;

type RequestOptions = {
  host: string;
  params?: object;
  body?: object;
  parseLimitsFn?: (response: any) => Limits;
  parseJSON?: boolean;
};

export function requestRapidApiFetch(
  methos: string,
  url: string,
  requestOptions: RequestOptions,
): Promise<RapidApiResponse>;
