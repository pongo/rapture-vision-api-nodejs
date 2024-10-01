"use strict";

const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const { Err, Ok, isOk } = require("./result");
const { parseLimits } = require("./balancer");

describe("parseLimits", () => {
  it("should parse Ok with limits data", () => {
    assert.deepEqual(parseLimits(Ok({ remaining: 100, reset: 5 })), { remaining: 100, reset: 5 });
  });

  it("should parse Error with limits data", () => {
    assert.deepEqual(parseLimits(Err("error", { remaining: 100, reset: 5 })), {
      remaining: 100,
      reset: 5,
    });
  });

  it("should parse Result without limits data", (t) => {
    assert.deepEqual(parseLimits(Ok({})), { remaining: -1, reset: 0 });
    assert.deepEqual(parseLimits(Err(new Error("error"))), { remaining: -1, reset: 0 });
    assert.deepEqual(parseLimits(Ok({ remaining: 100 })), { remaining: 100, reset: 0 });
  });
});
