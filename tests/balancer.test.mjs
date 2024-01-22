import { test, suite } from "uvu";
import * as assert from "uvu/assert";
import { describe } from "./utils.mjs";
import { parseLimits } from "../src/utils/balancer.js";
import { Err, Ok } from "../src/utils/result.js";

describe("parseLimits", (test) => {
  test("should parse Ok with limits data", () => {
    assert.equal(parseLimits(Ok({ remaining: 100, reset: 5 })), { remaining: 100, reset: 5 });
  });

  test("should parse Error with limits data", () => {
    assert.equal(parseLimits(Err("error", { remaining: 100, reset: 5 })), {
      remaining: 100,
      reset: 5,
    });
  });

  test("should parse Result without limits data", (t) => {
    assert.equal(parseLimits(Ok({})), { remaining: -1, reset: 0 });
    assert.equal(parseLimits(Err(new Error("error"))), { remaining: -1, reset: 0 });
    assert.equal(parseLimits(Ok({ remaining: 100 })), { remaining: 100, reset: 0 });
  });
});
