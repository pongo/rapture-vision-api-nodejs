import { StacklessError } from "./stackless-error";

type Ok<T> = {
  readonly isOk: true;
  readonly isErr: false;
  readonly value: T;
};

type Err<E extends Error = Error> = {
  readonly isOk: false;
  readonly isErr: true;
  readonly error: E;
};

export type Result<T = undefined, E extends Error = Error> = Ok<T> | Err<E>;

export function Ok<T = undefined>(value?: T): Result<T, never>;

export function Err<E extends Error = Error>(error: E): Result<never, E>;
export function Err<E extends Error = Error>(error: string, data?: unknown): Result<never, E>;
export function Err<E extends Error = Error>(error: E | string, data?: unknown): Result<never, E>;

export function isErr(result: Result<T, E>): result is Err<E>;
export function isOk(result: Result<T, E>): result is Ok<T>;
export function isResult<T, E>(value: unknown): value is Result<T, E>;
