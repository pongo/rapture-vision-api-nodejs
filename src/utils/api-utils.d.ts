import type { ApiFn } from "./balancer.d";

export declare function apiList<T, TParams>(
  apis: Record<string, ApiFn<T, TParams>>,
): Array<[string, ApiFn<T, TParams>]>;

export function startsWithHttp(str: string | undefined): boolean;
