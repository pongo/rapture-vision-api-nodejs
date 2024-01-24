"use strict";

const fs = require("node:fs/promises");
const { Ok, Err } = require("./result");
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

class FetchEmpty extends StacklessError {
  constructor(url) {
    super(`Empty fetch for "${url}"`);
  }
}

function FetchFactory(
  apiName,
  { fetchFn, parseFn, tmpFileNameFn, loadFn = undefined, saveFn = undefined } = {}
) {
  return async function (url, { loadFromDisk = false, saveToDisk = false } = {}) {
    try {
      const data = await _fetch();
      if (saveToDisk) {
        await _save(data);
      }

      const videos = parseFn(data);
      if (Array.isArray(videos) && videos.length > 0) {
        return Ok({ videos });
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

    async function _fetch() {
      if (loadFromDisk) {
        const load = loadFn ?? loadJson;
        const file = await load(_tmpFilePath());
        return file?.data;
      }

      return fetchFn(url);
    }
  };
}

if (globalThis.UVU_DEFER) {
  const assert = require("uvu/assert");
  const { describe } = require("tests/utils");
  const { mock } = require("node:test");

  describe("FetchFactory with default params", (it) => {
    it("happy path", async () => {
      const fetchFn = mock.fn(() => ({ code: "42" }));
      const parseFn = mock.fn(({ code }) => [code]);
      const tmpFileNameFn = mock.fn(() => "tmpFileNameFn");
      const loadFn = mock.fn();
      const saveFn = mock.fn();

      const smth = FetchFactory("tiktok/smth", { fetchFn, parseFn, tmpFileNameFn, loadFn, saveFn });

      const actual = await smth("url2");
      assert.ok(actual.isOk, actual.error);
      assert.equal(actual.value, { videos: ["42"] });

      assert.is(fetchFn.mock.calls.length, 1);
      assert.equal(fetchFn.mock.calls[0].arguments, ["url2"]);

      assert.is(parseFn.mock.calls.length, 1);
      assert.equal(parseFn.mock.calls[0].arguments, [{ code: "42" }]);

      assert.is(tmpFileNameFn.mock.calls.length, 0);
      assert.is(loadFn.mock.calls.length, 0);
      assert.is(saveFn.mock.calls.length, 0);
    });

    it("empty parse", async () => {
      const fetchFn = mock.fn(() => ({ code: "42" }));
      const parseFn = mock.fn(() => undefined);
      const smth = FetchFactory("tiktok/smth", { fetchFn, parseFn });

      const actual = await smth("url2");
      assert.ok(actual.isErr);
      assert.equal(actual.error.name, "FetchEmpty");
    });

    it("throwing error", async () => {
      const fetchFn = mock.fn(() => {
        throw Error("oops");
      });
      const parseFn = mock.fn(() => undefined);
      const smth = FetchFactory("tiktok/smth", { fetchFn, parseFn });

      const actual = await smth("url2");
      assert.ok(actual.isErr);
      assert.equal(actual.error.name, "FetchCatchError");

      assert.is(fetchFn.mock.calls.length, 1);
      assert.is(parseFn.mock.calls.length, 0);
    });
  });

  describe("FetchFactory load from disk", (it) => {
    it("happy path", async () => {
      const fetchFn = mock.fn(() => ({ code: "42" }));
      const parseFn = mock.fn(({ code }) => [code]);
      const tmpFileNameFn = mock.fn(() => "tmpFileNameFn");
      const loadFn = mock.fn(() => ({ data: { code: "43" } }));
      const saveFn = mock.fn();

      const smth = FetchFactory("tiktok/smth", { fetchFn, parseFn, tmpFileNameFn, loadFn, saveFn });

      const actual = await smth("url2", { loadFromDisk: true });
      assert.ok(actual.isOk, `${actual?.error?.name}: ${actual?.error?.message}`);
      assert.equal(actual.value, { videos: ["43"] });

      assert.is(fetchFn.mock.calls.length, 0, "fetchFn calls");

      assert.is(loadFn.mock.calls.length, 1, "loadFn calls");
      assert.equal(
        loadFn.mock.calls[0].arguments,
        ["./tmp/tiktok/smth/tmpFileNameFn.json"],
        "loadFn args"
      );

      assert.is(parseFn.mock.calls.length, 1, "parseFn calls");
      assert.equal(parseFn.mock.calls[0].arguments, [{ code: "43" }], "parseFn args");

      assert.is(tmpFileNameFn.mock.calls.length, 1, "tmpFileNameFn calls");
      assert.equal(tmpFileNameFn.mock.calls[0].arguments, ["url2"], "tmpFileNameFn args");

      assert.is(saveFn.mock.calls.length, 0, "saveFn calls");
    });
  });

  describe("FetchFactory save to disk", (it) => {
    it("happy path", async () => {
      const fetchFn = mock.fn(() => ({ code: "42" }));
      const parseFn = mock.fn(({ code }) => [code]);
      const tmpFileNameFn = mock.fn(() => "tmpFileNameFn");
      const loadFn = mock.fn();
      const saveFn = mock.fn();

      const smth = FetchFactory("tiktok/smth", { fetchFn, parseFn, tmpFileNameFn, loadFn, saveFn });

      const actual = await smth("url2", { saveToDisk: true });
      assert.ok(actual.isOk);
      assert.equal(actual.value, { videos: ["42"] });

      assert.is(fetchFn.mock.calls.length, 1);
      assert.equal(fetchFn.mock.calls[0].arguments, ["url2"]);

      assert.is(parseFn.mock.calls.length, 1);
      assert.equal(parseFn.mock.calls[0].arguments, [{ code: "42" }]);

      assert.is(tmpFileNameFn.mock.calls.length, 1);
      assert.is(saveFn.mock.calls.length, 1, "saveFn calls");
      assert.equal(
        saveFn.mock.calls[0].arguments,
        [
          "./tmp/tiktok/smth/tmpFileNameFn.json",
          {
            url: "url2",
            data: { code: "42" },
          },
        ],
        "saveFn args"
      );

      assert.is(loadFn.mock.calls.length, 0);
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

if (globalThis.UVU_DEFER) {
  const assert = require("uvu/assert");
  const { describe } = require("tests/utils");

  describe("getTmpFilePath", (it) => {
    it("should sanitize filename", () => {
      assert.is(
        getTmpFilePath("tiktok/apiname", "https:__tiktok.com_not-parsed_"),
        "./tmp/tiktok/apiname/https__tiktok.com_not-parsed_.json"
      );
    });
  });
}

// if (process.env.NODE_ENV === "test") {
//   const assert = require("node:assert");
//   const { describe, it } = require("node:test");

//   describe("getTmpFilePath", () => {
//     it("should sanitize filename", () => {
//       assert.strictEqual(
//         getTmpFilePath("tiktok/apiname", "some:file:name"),
//         "./tmp/tiktok/apiname/somefilename.json"
//       );
//     });
//   });
// }

module.exports = { FetchFactory };
