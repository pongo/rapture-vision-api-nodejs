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

type FactoryOptions = {
  fetchFn: (url: string) => Promise<Result<unknown>>;
  parseFn: (data: unknown) => unknown;
  checkFn: (data: unknown) => boolean;
  tmpFileNameFn: (url: string) => string;
  checkUrlFn: (url: string) => boolean;
  loadFn?: (path: string) => Promise<object>;
  saveFn?: (path: string, data: object) => Promise<void>;
};

type FetchResult = {
  videos: string[];
};

type FactoryResultFn = (
  url: string,
  {
    loadFromDisk,
    saveToDisk,
  }?: {
    loadFromDisk?: boolean | undefined;
    saveToDisk?: boolean | undefined;
  },
) => Promise<Result<FetchResult, FetchError>>;

export declare function FetchFactory(
  apiName: string,
  { fetchFn, parseFn, checkFn, tmpFileNameFn, checkUrlFn, loadFn, saveFn }: FactoryOptions,
): FactoryResultFn;
