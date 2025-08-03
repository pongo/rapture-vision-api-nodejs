import express from "express";
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { requestRapidApiFetch } from "../../../src/utils/rapidapi.js";
import { ServerTestFetch } from "../../utils/server.js";
import { createLogManager, formatErr } from "../../utils/utils.js";

const RAPID_API_KEY = process.env.RAPID_API_KEY;
const logManager = createLogManager();
const { tserver } = setupTestServer();

before(async () => {
  logManager.silent();
  await tserver.start();
});

after(async () => {
  if (RAPID_API_KEY == null) delete process.env.RAPID_API_KEY;
  else process.env.RAPID_API_KEY = RAPID_API_KEY;

  logManager.restore();
  await tserver.stop();
});

function setupTestServer() {
  const DEFAULT_HEADERS = {
    "x-ratelimit-requests-remaining": 100,
    "x-ratelimit-requests-reset": 24,
  };

  const app = express();
  app.use(express.json());

  app.use((_req, res, next) => {
    res.set(DEFAULT_HEADERS);
    next();
  });

  app.get("/", (req, res) => {
    res.json({ headers: req.headers, query: req.query });
  });

  app.post("/", (req, res) => {
    res.json({ body: req.body });
  });

  app.get("/400", (req, res) => {
    res.status(400).json({ message: "this is an error" });
  });

  app.get("/429", (req, res) => {
    res.status(429).json({ message: "-" });
  });

  app.get("/json_fail", (req, res) => {
    res.end("} not json");
  });

  return { tserver: new ServerTestFetch(app) };
}

describe("requestRapidApi", () => {
  const host = "localhost";

  it("should pass headers", async () => {
    process.env.RAPID_API_KEY = "KEY";
    const res = await requestRapidApiFetch("GET", tserver.url("/"), { host });
    // console.dir(res, { depth: null });
    assert.ok(res.isOk, formatErr(res));
    assert.equal(res.value.data.headers["x-rapidapi-key"], "KEY");
    assert.equal(res.value.data.headers["x-rapidapi-host"], "localhost");
    assert.equal(res.value.data.headers["content-type"], "application/json");

    delete process.env.RAPID_API_KEY;
    const res2 = await requestRapidApiFetch("GET", tserver.url("/"), { host });
    assert.ok(res2.isOk, formatErr(res2));
    assert.equal(res2.value.data.headers["x-rapidapi-key"], "");
  });

  it("should parse limits", async () => {
    const res = await requestRapidApiFetch("GET", tserver.url("/"), { host });
    assert.ok(res.isOk, formatErr(res));
    assert.ok(Number.isInteger(res.value.remaining));
    assert.ok(Number.isInteger(res.value.reset));
    assert.equal(res.value.remaining, 100);
    assert.equal(res.value.reset, 24);
  });

  it("should pass single query param", async () => {
    const res = await requestRapidApiFetch("GET", tserver.url("/"), {
      host,
      params: { p1: "tom" },
    });
    assert.ok(res.isOk, formatErr(res));
    assert.equal(res.value.data.query["p1"], "tom");
  });

  it("should pass multiple query params", async () => {
    const res = await requestRapidApiFetch("GET", tserver.url("/"), {
      host,
      params: { p1: "tom", p2: "jerry" },
    });
    assert.ok(res.isOk, formatErr(res));
    assert.equal(res.value.data.query["p1"], "tom");
    assert.equal(res.value.data.query["p2"], "jerry");

    const res2 = await requestRapidApiFetch("GET", tserver.url("/?v=1"), {
      host,
      params: { p1: "tom", p2: "jerry" },
    });
    assert.ok(res2.isOk, formatErr(res2));
    assert.equal(res2.value.data.query["p1"], "tom");
    assert.equal(res2.value.data.query["p2"], "jerry");
    assert.equal(res2.value.data.query["v"], "1");
  });

  it("should pass body", async () => {
    const resEmptyBody = await requestRapidApiFetch("POST", tserver.url("/"), {
      host,
    });
    // console.dir(resEmptyBody, { depth: null });
    assert.ok(resEmptyBody.isOk, formatErr(resEmptyBody));
    assert.deepEqual(resEmptyBody.value.data.body, {});

    const res = await requestRapidApiFetch("POST", tserver.url("/"), {
      host,
      body: { hello: "world" },
    });

    // console.dir(res, { depth: null });
    assert.ok(res.isOk, formatErr(res));
    assert.deepEqual(res.value.data.body, { hello: "world" });
  });

  it("should catch http errors", async () => {
    const res = await requestRapidApiFetch("GET", tserver.url("/400"), { host });

    // console.dir(res, { depth: null });
    assert.ok(res.isErr, "should be error");
    assert.equal(res.error.message, "400 Bad Request");
    assert.ok(Number.isInteger(res.error.data.remaining));
    assert.ok(Number.isInteger(res.error.data.reset));
    assert.deepEqual(res.error.data, { remaining: 100, reset: 24 });
  });

  it("should catch 429 error", async () => {
    const res = await requestRapidApiFetch("GET", tserver.url("/429"), { host });

    // console.dir(res, { depth: null });
    assert.ok(res.isErr, "should be error");
    assert.equal(res.error.message, "429 Too Many Requests");
    assert.ok(Number.isInteger(res.error.data.remaining));
    assert.ok(Number.isInteger(res.error.data.reset));
    assert.deepEqual(res.error.data, { remaining: 0, reset: 3600 });
  });

  it("should catch other errors", async () => {
    const res = await requestRapidApiFetch("GET", tserver.url("/json_fail"), { host });

    // console.dir(res, { depth: null });
    assert.ok(res.isErr, "should be error");
    assert.equal(res.error.message, `Unexpected token '}', "} not json" is not valid JSON`);
    assert.equal(res.error.data.error.name, "SyntaxError");
    assert.ok(Number.isInteger(res.error.data.remaining));
    assert.ok(Number.isInteger(res.error.data.reset));
    assert.equal(res.error.data.remaining, -1);
    assert.equal(res.error.data.reset, 0);
  });

  it("can disable JSON parsing", async () => {
    const res = await requestRapidApiFetch("GET", tserver.url("/json_fail"), {
      host,
      parseJSON: false,
    });
    assert.ok(res.isOk, formatErr(res));
    assert.deepEqual(res.value.data, "} not json");
  });
});
