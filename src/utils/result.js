import { StacklessError } from "./stackless-error.js";

// /**
//  * @param value
//  * @returns {{isOk: true, isErr: false, value}}
//  */

export function Ok(value) {
  return {
    isOk: true,
    isErr: false,
    value: value,
  };
}

// /**
//  * @param {string|Error} error
//  * @param data
//  * @returns {{isOk: false, isErr: true, error: Error}}
//  */

export function Err(error, data) {
  return {
    isOk: false,
    isErr: true,
    error: typeof error === "string" ? new StacklessError(error, data) : error,
  };
}

export const isErr = (result) => result.isErr;
export const isOk = (result) => result.isOk;
export const isResult = (value) => value.isOk || value.isErr;
