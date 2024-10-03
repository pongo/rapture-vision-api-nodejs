"use strict";

const { StacklessError } = require("./stackless-error");

// /**
//  * @param value
//  * @returns {{isOk: true, isErr: false, value}}
//  */

function ok(value) {
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

function err(error, data) {
  return {
    isOk: false,
    isErr: true,
    error: typeof error === "string" ? new StacklessError(error, data) : error,
  };
}

// module.exports.Result = { ok, err };
module.exports.Ok = ok;
module.exports.Err = err;

module.exports.isErr = (result) => result.isErr;
module.exports.isOk = (result) => result.isOk;
module.exports.isResult = (value) => value.isOk || value.isErr;
