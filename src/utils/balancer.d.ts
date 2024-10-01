import { Result } from "./result.d";

type Limits = {
  reset?: number;
  remaining?: number;
};
type ErrorWithLimits = Error & { data?: Limits };
export type ApiResult<T> = Result<T & Limits, ErrorWithLimits>;
export type ApiFn<T> = (...payload: unknown[]) => Promise<ApiResult<T>>;

interface IAnalytics {
  async trackApiCall(service: str, api: str, isOk: bool, elapsedMs: number): Promise<void>;
}

export type BalancerOptions<T> = {
  name: string;
  apis: Array<[string, ApiFn<T>]>;
  shuffle?: boolean;
  strategy?: "last" | "again" | "random";
  analytics?: IAnalytics;
};

export declare class Balancer<T> {
  constructor(options: BalancerOptions<T>);
  callOneRound<T>(...payload: unknown[]): Promise<ApiResult<T>>;
}

export function parseLimits<T>(result: ApiResult<T>): Required<Limits>;
