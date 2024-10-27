import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseLimits } from "./balancer.js";
import { Err, Ok } from "./result.js";

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

  it("should parse Result without limits data", () => {
    assert.deepEqual(parseLimits(Ok({})), { remaining: -1, reset: 0 });
    assert.deepEqual(parseLimits(Err(new Error("error"))), { remaining: -1, reset: 0 });
    assert.deepEqual(parseLimits(Ok({ remaining: 100 })), { remaining: 100, reset: 0 });
  });
});
