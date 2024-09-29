"use strict";

const fs = require("node:fs/promises");
const { Ok, Err, isErr } = require("./result");
const { StacklessError } = require("./stackless-error");
const { sanitizeFilename } = require("./sanitize-filename");
const writeJsonFile = require("write-json-file");

class FetchCatchError extends Error {
  constructor(url, catchedError) {
    super(`${catchedError.message} for "${url}"`);
    this.catchedError = catchedError;
    this.name = this.constructor.name;
  }
}

// TODO: переименовать. ошибка возвращается если не проходит checkFn
class FetchEmpty extends StacklessError {
  constructor(url) {
    super(`Empty fetch for "${url}"`);
  }
}

/**
 * @template T
 * @template F
 * @param {string} apiName
 * @param {import("./fetch-factory").FactoryOptions<T, F>} factoryOptions
 * @returns {import("./fetch-factory").FetchFn<T>}
 */
function FetchFactory(apiName, factoryOptions) {
  const {
    fetchFn,
    parseFn,
    checkFn,
    tmpFileNameFn,
    checkUrlFn = undefined,
    loadFn = undefined,
    saveFn = undefined,
  } = factoryOptions;
  return async function (url, options = {}) {
    const { loadFromDisk = false, saveToDisk = false } = options;
    try {
      _checkUrl();

      const dataResult = await _fetch();
      if (isErr(dataResult)) {
        return dataResult;
      }

      const data = dataResult.value;
      if (saveToDisk) {
        await _save(data);
      }

      const result = await parseFn(data, url, options);
      if (checkFn(result)) {
        return Ok(result);
      } else {
        return Err(new FetchEmpty(url));
      }
    } catch (e) {
      return Err(new FetchCatchError(url, e));
    }

    function _tmpFilePath() {
      return getTmpFilePath(apiName, tmpFileNameFn(url));
    }

    async function _save(data) {
      const save = saveFn ?? writeJsonFile;
      await save(_tmpFilePath(), { url, data });
    }

    function _checkUrl() {
      if (checkUrlFn == null) return;
      if (checkUrlFn(url)) return;
      throw new StacklessError("Invalid url", { url });
    }

    async function _fetch() {
      if (loadFromDisk) {
        const load = loadFn ?? loadJson;
        const data = (await load(_tmpFilePath()))?.data;
        if (!data) {
          throw new StacklessError(`Empty data in ${_tmpFilePath()}`, { url });
        }
        return Ok(data);
      }

      const res = await fetchFn(url);
      return res.isOk || res.isErr ? res : Ok(res);
    }
  };
}

if (process.env.NODE_ENV === "test" && require.main === module) {
  // @ts-expect-error inline testing
  const assert = require("node:assert/strict");
  const { describe, it, mock } = require("node:test");
  const throwNotImplemented = () => {
    throw Error("Not implemented");
  };

  describe("FetchFactory", () => {
    describe("with default params", () => {
      it("happy path", async () => {
        const fetchFn = mock.fn(async () => ({ code: "42" }));
        const parseFn = mock.fn(({ code }) => ({ videos: [code] }));
        const checkFn = mock.fn(({ videos }) => Array.isArray(videos) && videos.length === 1);
        const tmpFileNameFn = mock.fn(() => "tmpFileNameFn");
        const loadFn = mock.fn();
        const saveFn = mock.fn();

        const smth = FetchFactory("tiktok/smth", {
          // @ts-expect-error internal fetchFn can works without Result
          fetchFn,
          parseFn,
          checkFn,
          tmpFileNameFn,
          loadFn,
          saveFn,
        });

        const actual = await smth("url2");
        assert.ok(actual.isOk, actual.isErr && actual.error);
        assert.deepEqual(actual.value, { videos: ["42"] });

        assert.equal(fetchFn.mock.calls.length, 1);
        assert.deepEqual(fetchFn.mock.calls[0].arguments, ["url2"]);

        assert.equal(parseFn.mock.calls.length, 1);
        assert.deepEqual(parseFn.mock.calls[0].arguments, [{ code: "42" }, "url2", {}]);

        assert.equal(tmpFileNameFn.mock.calls.length, 0);
        assert.equal(loadFn.mock.calls.length, 0);
        assert.equal(saveFn.mock.calls.length, 0);
      });

      it("empty parse", async () => {
        const fetchFn = mock.fn(async () => Ok({ code: "42" }));
        const parseFn = mock.fn(() => undefined);
        const checkFn = mock.fn(() => false);
        const smth = FetchFactory("tiktok/smth", {
          fetchFn,
          parseFn,
          checkFn,
          tmpFileNameFn: throwNotImplemented,
        });

        const actual = await smth("url2");
        assert.ok(actual.isErr);
        assert.deepEqual(actual.error.name, "FetchEmpty", actual.error.message);
      });

      it("throwing error", async () => {
        const fetchFn = mock.fn(() => {
          throw Error("oops");
        });
        const parseFn = mock.fn(() => undefined);
        const smth = FetchFactory("tiktok/smth", {
          fetchFn,
          parseFn,
          checkFn: throwNotImplemented,
          tmpFileNameFn: throwNotImplemented,
        });

        const actual = await smth("url2");
        assert.ok(actual.isErr);
        assert.deepEqual(actual.error.name, "FetchCatchError");

        assert.equal(fetchFn.mock.calls.length, 1);
        assert.equal(parseFn.mock.calls.length, 0);
      });
    });

    describe("load from disk", () => {
      it("happy path", async () => {
        const fetchFn = mock.fn(async () => Ok({ code: "42" }));
        const parseFn = mock.fn(({ code }) => ({ videos: [code] }));
        const checkFn = mock.fn(() => true);
        const tmpFileNameFn = mock.fn(() => "tmpFileNameFn");
        const loadFn = mock.fn(async () => ({ data: { code: "43" } }));
        const saveFn = mock.fn();

        const smth = FetchFactory("tiktok/smth", {
          fetchFn,
          parseFn,
          checkFn,
          tmpFileNameFn,
          loadFn,
          saveFn,
        });

        const actual = await smth("url2", { loadFromDisk: true });
        assert.ok(actual.isOk, actual.isErr && `${actual.error.name}: ${actual.error.message}`);
        assert.deepEqual(actual.value, { videos: ["43"] });

        assert.equal(fetchFn.mock.calls.length, 0, "fetchFn calls");

        assert.equal(loadFn.mock.calls.length, 1, "loadFn calls");
        assert.deepEqual(
          loadFn.mock.calls[0].arguments,
          ["./tmp/tiktok/smth/tmpFileNameFn.json"],
          "loadFn args",
        );

        assert.equal(parseFn.mock.calls.length, 1, "parseFn calls");
        assert.deepEqual(
          parseFn.mock.calls[0].arguments,
          [{ code: "43" }, "url2", { loadFromDisk: true }],
          "parseFn args",
        );

        assert.equal(tmpFileNameFn.mock.calls.length, 1, "tmpFileNameFn calls");
        assert.deepEqual(tmpFileNameFn.mock.calls[0].arguments, ["url2"], "tmpFileNameFn args");

        assert.equal(saveFn.mock.calls.length, 0, "saveFn calls");
      });
    });

    describe("save to disk", () => {
      it("happy path", async () => {
        const fetchFn = mock.fn(async () => Ok({ code: "42" }));
        const parseFn = mock.fn(({ code }) => ({ videos: [code] }));
        const checkFn = mock.fn(() => true);
        const tmpFileNameFn = mock.fn(() => "tmpFileNameFn");
        const loadFn = mock.fn();
        const saveFn = mock.fn();

        const smth = FetchFactory("tiktok/smth", {
          fetchFn,
          parseFn,
          checkFn,
          tmpFileNameFn,
          loadFn,
          saveFn,
        });

        const actual = await smth("url2", { saveToDisk: true });
        assert.ok(actual.isOk);
        assert.deepEqual(actual.value, { videos: ["42"] });

        assert.equal(fetchFn.mock.calls.length, 1);
        assert.deepEqual(fetchFn.mock.calls[0].arguments, ["url2"]);

        assert.equal(parseFn.mock.calls.length, 1);
        assert.deepEqual(parseFn.mock.calls[0].arguments, [
          { code: "42" },
          "url2",
          { saveToDisk: true },
        ]);

        assert.equal(tmpFileNameFn.mock.calls.length, 1);
        assert.equal(saveFn.mock.calls.length, 1, "saveFn calls");
        assert.deepEqual(
          saveFn.mock.calls[0].arguments,
          [
            "./tmp/tiktok/smth/tmpFileNameFn.json",
            {
              url: "url2",
              data: { code: "42" },
            },
          ],
          "saveFn args",
        );

        assert.equal(loadFn.mock.calls.length, 0);
      });
    });
  });
}

async function loadJson(path) {
  return JSON.parse(await fs.readFile(path, "utf-8"));
  // try {
  //   return JSON.parse(await fs.readFile(path, "utf-8"));
  // } catch {
  //   return undefined;
  // }
}

function getTmpFilePath(apiName, filename) {
  return `./tmp/${apiName}/${sanitizeFilename(filename)}.json`;
}

if (process.env.NODE_ENV === "test" && require.main === module) {
  // @ts-expect-error inline testing
  const assert = require("node:assert/strict");
  const { test } = require("node:test");

  test("getTmpFilePath", () => {
    assert.equal(
      getTmpFilePath("tiktok/apiname", "https:__tiktok.com_not-parsed_"),
      "./tmp/tiktok/apiname/https__tiktok.com_not-parsed_.json",
    );
  });
}

module.exports = { FetchFactory };
