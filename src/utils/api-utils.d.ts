import { ApiFn } from "./balancer.d";

export declare function apiList<T, TParams>(
  apis: Record<string, ApiFn<T, TParams>>,
): Array<[string, ApiFn<T, TParams>]>;
