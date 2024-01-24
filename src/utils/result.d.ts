type Ok<T> = {
  readonly isOk: true;
  readonly isErr: false;
  readonly value: T;
};
type Err0<E extends Error = Error> = {
  readonly isOk: false;
  readonly isErr: true;
  readonly error: E;
};
export type Result<T = undefined, E extends Error = Error> = Ok<T> | Err0<E>;

export declare function Ok<T = undefined>(value?: T): Result<T, never>;

type Err1 = <E extends Error = Error>(error: E) => Result<never, E>;
type Err2 = <E extends Error = Error>(error: string, data?: unknown) => Result<never, E>;

export type Err = Err1 & Err2;

export declare function Err<E extends Error = Error>(error: E): Result<never, E>;
export declare function Err<E extends Error = Error>(
  error: string,
  data?: unknown
): Result<never, E>;

export {};
