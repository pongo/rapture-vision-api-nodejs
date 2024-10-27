import type { Ok, Result } from "./result.d.ts";
import type { StacklessError } from "./stackless-error.d.ts";

export declare class FetchCatchError extends Error {
  readonly catchedError: Error;
  constructor(url: string, catchedError: Error);
}

export declare class FetchEmpty extends StacklessError {
  constructor(url: string);
}

export type FetchError = FetchEmpty | FetchCatchError;

export type FactoryOptions<TParseResult, TFetchResult, TFetchOptionsExtension = {}> = {
  fetchFn: (url: string) => Promise<Result<TFetchResult>> | Promise<TFetchResult>;
  parseFn: (
    data: TFetchResult,
    url: string,
    options: FetchOptions & TFetchOptionsExtension,
  ) => TParseResult;
  checkFn?: (data: TParseResult) => boolean;
  tmpFileNameFn?: (url: string) => string;
  checkUrlFn?: (url: string) => boolean;
  loadFn?: (path: string) => Promise<TFetchResult>;
  saveFn?: (path: string, data: object) => Promise<void>;
};

export type FetchOptions = {
  loadFromDisk?: boolean;
  saveToDisk?: boolean;
  fakeLoadFromDiskData?: Ok<any>;
};

export type FetchFn<T> = (url: string, options?: FetchOptions) => Promise<Result<T, FetchError>>;
export type FetchFnParameters<T> = Parameters<FetchFn<T>>;

export function FetchFactory<T, F>(
  apiName: string,
  factoryOptions: FactoryOptions<T, F>,
): FetchFn<T>;

export function getTmpFilePath(apiName: string, filename: string): string;
