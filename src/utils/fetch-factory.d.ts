import { FactoryOptions } from "./fetch-factory.d";
import { Result } from "./result.d";
import { StacklessError } from "./stackless-error";

export declare class FetchCatchError extends Error {
  readonly catchedError: Error;
  constructor(url: string, catchedError: Error);
}

export declare class FetchEmpty extends StacklessError {
  constructor(url: string);
}

export type FetchError = FetchEmpty | FetchCatchError;

export type FactoryOptions<T, F> = {
  fetchFn: (url: string) => Promise<Result<F>>;
  parseFn: (data: F, url: string, options: FetchOptions) => T;
  checkFn: (data: T) => boolean;
  tmpFileNameFn: (url: string) => string;
  checkUrlFn?: (url: string) => boolean;
  loadFn?: (path: string) => Promise<F>;
  saveFn?: (path: string, data: object) => Promise<void>;
};

export type FetchOptions = {
  loadFromDisk?: boolean;
  saveToDisk?: boolean;
};

export type FetchFn<T> = (url: string, options?: FetchOptions) => Promise<Result<T, FetchError>>;

export function FetchFactory<T, F>(
  apiName: string,
  factoryOptions: FactoryOptions<T, F>,
): FetchFn<T>;
