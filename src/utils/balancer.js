"use strict";

const Keyv = require("keyv");
const { KeyvFile } = require("keyv-file");
const { Err, Ok, isOk } = require("./result");

// https://stackoverflow.com/a/12646864/136559
function shuffleArrayInplace(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function createIterableList(items, shuffle = true) {
  const _items = [...items];
  const length = _items.length;
  let nextIndex = 0;
  if (shuffle) {
    shuffleArrayInplace(_items);
  }

  return { oneRoundFromLast, oneRoundFromBeginning, oneRoundFromRandom };

  function oneRoundFromBeginning() {
    nextIndex = 0;
    return oneRound();
  }

  function oneRoundFromRandom() {
    nextIndex = Math.floor(Math.random() * length);
    return oneRound();
  }

  function oneRoundFromLast() {
    return oneRound();
  }

  function oneRound() {
    let iteratorLength = length;
    let done = false;
    return { [Symbol.iterator]: next };

    function next() {
      return {
        next() {
          if (done) {
            return { value: undefined, done: true };
          }
          iteratorLength--;
          const currentIndex = nextIndex;
          nextIndex = (nextIndex + 1) % length;
          done = iteratorLength < 0;
          return { value: _items[currentIndex], done };
        },
      };
    }
  }
}

/**
 * @template T
 */
class Balancer {
  /**
   * @param {import("./balancer").BalancerOptions<T>} options
   */
  constructor(options) {
    const { name, apis, shuffle = true, strategy = "last" } = options;
    this.keyv = new Keyv({
      store: new KeyvFile({
        filename: `${name}-limits.json`,
      }),
    });
    this.apis = createIterableList(apis, shuffle);
    switch (strategy) {
      case "last":
        this.apisOneRound = this.apis.oneRoundFromLast;
        break;
      case "again":
        this.apisOneRound = this.apis.oneRoundFromBeginning;
        break;
      case "random":
        this.apisOneRound = this.apis.oneRoundFromRandom;
        break;
      default:
        throw new Error(`Unknown strategy "${strategy}"`);
    }
  }

  async callOneRound(...payload) {
    for (const [apiName, call] of this.apisOneRound()) {
      if (await this._isLimited(apiName)) {
        console.log(`[Balancer] Api "${apiName}" is limited`);
        continue;
      }

      console.log(`[Balancer] Call api "${apiName}"...`);
      try {
        const result = await call(...payload);
        await this._setRemaining(apiName, result);

        if (result.isOk) return result;
        console.error(result.error);
      } catch (error) {
        console.error(error);
      }
    }

    // noinspection JSValidateTypes
    return Err(`[Balancer] all apis failed`);
  }

  async _isLimited(apiName) {
    const remaining = await this._getRemaining(apiName);
    if (remaining == null) return false;
    if (remaining < 3) return true;
    else return false;
  }

  async _getRemaining(apiName) {
    return this.keyv.get(apiName);
  }

  async _setRemaining(apiName, result) {
    const { remaining, reset } = parseLimits(result);
    // console.log(apiName, remaining, reset, result);
    if (remaining < 0 || reset <= 0) {
      // await this.keyv.delete(apiName);
      return;
    }
    await this.keyv.set(apiName, remaining, reset * 1000);
  }
}

/**
 * @template T
 * @param {import("./balancer").ApiResult<T>} result
 * @returns {{ remaining: number, reset: number }}
 */
function parseLimits(result) {
  const remaining = (isOk(result) ? result.value.remaining : result.error.data?.remaining) ?? -1;
  const reset = (isOk(result) ? result.value.reset : result.error.data?.reset) ?? 0;
  return { remaining, reset };
}

if (process.env.NODE_ENV === "test" && require.main === module) {
  const assert = require("node:assert/strict");
  const { describe, it } = require("node:test");

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
}

module.exports = { Balancer };
