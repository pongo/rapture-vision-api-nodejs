"use strict";

const { Keyv } = require("keyv");
const { KeyvFile } = require("keyv-file");
const { Err, isOk } = require("./result");
const { timeStart } = require("./time-start");

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

/** @type {import("./balancer").IAnalytics} */
const nullAnalytics = {
  trackApiCall: async () => {},
};

/**
 * @template T
 * @template TParams
 */
class Balancer {
  /**
   * @param {import("./balancer").BalancerOptions<T, TParams>} options
   */
  constructor(options) {
    const { name, apis, shuffle = true, strategy = "last" } = options;

    this.name = name;

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

    this.analytics = options.analytics == null ? nullAnalytics : options.analytics;
  }

  async callOneRound(...payload) {
    for (const [apiName, call] of this.apisOneRound()) {
      if (await this._isLimited(apiName)) {
        console.log(`[Balancer] Api "${apiName}" is limited`);
        continue;
      }

      console.log(`[Balancer] Call api "${apiName}"...`);
      const elapsed = timeStart();
      try {
        const result = await call(...payload);
        const elapsedMs = elapsed();
        await this._setRemaining(apiName, result);

        if (result.isOk) {
          this.analytics.trackApiCall(this.name, apiName, true, elapsedMs);
          return result;
        }

        console.error(result.error);
        this.analytics.trackApiCall(this.name, apiName, false, elapsedMs);
      } catch (error) {
        console.error(error);
        this.analytics.trackApiCall(this.name, apiName, false, elapsed());
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

function parseLimits(result) {
  const remaining = (isOk(result) ? result.value.remaining : result.error.data?.remaining) ?? -1;
  const reset = (isOk(result) ? result.value.reset : result.error.data?.reset) ?? 0;
  return { remaining, reset };
}

module.exports = { Balancer, parseLimits };
