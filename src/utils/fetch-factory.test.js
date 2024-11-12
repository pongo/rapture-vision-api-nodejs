import assert from "node:assert/strict";
import { describe, it, mock, test } from "node:test";
import { FetchFactory, getTmpFilePath } from "./fetch-factory.js";
import { Ok } from "./result.js";
import { formatErr } from "../../tests/utils/utils.js";

const throwNotImplemented = () => {
  throw new Error("Not implemented");
};

describe("FetchFactory", () => {
  describe("with default params", () => {
    it("happy path", async () => {
      const fetchFn = mock.fn(async () => ({ code: "42" }));
      const parseFn = mock.fn(({ code }) => ({ videos: [code] }));
      const checkFn = mock.fn(({ videos }) => Array.isArray(videos) && videos.length === 1);
      const tmpFileNameFn = mock.fn(() => "tmpFileNameFn");
      const loadFn = /** @type {any} */ (mock.fn());
      const saveFn = /** @type {any} */ (mock.fn());

      const smth = FetchFactory("tiktok/smth", {
        fetchFn,
        parseFn,
        checkFn,
        tmpFileNameFn,
        loadFn,
        saveFn,
      });

      const actual = await smth("url2");
      assert.ok(actual.isOk, formatErr(actual));
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
        throw new Error("oops");
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
      const saveFn = /** @type {any} */ (mock.fn());

      const smth = FetchFactory("tiktok/smth", {
        fetchFn,
        parseFn,
        checkFn,
        tmpFileNameFn,
        loadFn,
        saveFn,
      });

      const actual = await smth("url2", { loadFromDisk: true });
      assert.ok(actual.isOk, formatErr(actual));
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
      const loadFn = /** @type {any} */ (mock.fn());
      const saveFn = /** @type {any} */ (mock.fn());

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

test("getTmpFilePath", () => {
  assert.equal(
    getTmpFilePath("tiktok/apiname", "https:__tiktok.com_not-parsed_"),
    "./tmp/tiktok/apiname/https__tiktok.com_not-parsed_.json",
  );
});
