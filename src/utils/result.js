"use strict";

const { StacklessError } = require("./stackless-error");

function ok(value) {
  return {
    isOk: true,
    isErr: false,
    value: value,
  };
}

/**
 * @param {string|Error} error
 * @param data
 */
function err(error, data) {
  return {
    isOk: false,
    isErr: true,
    error: typeof error === "string" ? new StacklessError(error, data) : error,
  };
}

module.exports.Result = {
  ok,
  err,
};
module.exports.Ok = ok;
module.exports.Err = err;
