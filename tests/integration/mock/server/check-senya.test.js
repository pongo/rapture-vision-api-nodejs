import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { createServer } from "../../../../src/server/server.js";
import { Err, Ok } from "../../../../src/utils/result.js";
import { StacklessError } from "../../../../src/utils/stackless-error.js";
import { createLogManager } from "../../../utils/utils.js";
import {
  assertServiceThrow,
  assertValidationError,
  notImplementedServerConfig,
  ServerTest,
} from "../../../utils/server.js";

const logManager = createLogManager();

before(logManager.silent);
after(logManager.restore);

const app = createServer({
  ...notImplementedServerConfig,
  checkSenya: async (url) => {
    switch (url) {
      case "ok_true":
        return Ok(true);
      case "ok_false":
        return Ok(false);
      case "throw":
        throw new Error("unexpected error");
      case "throwEmpty":
        throw new StacklessError();
      default:
        return Err("err");
    }
  },
});
const tserver = new ServerTest(app);
before(async () => tserver.start());
after(async () => tserver.stop());

const apiUrl = "/api/senya";

async function checkOkSenya(url, is_senya) {
  const res = await tserver.post(apiUrl, { url });
  assert.equal(res.statusCode, 200);
  const data = JSON.parse(res.body);
  assert.deepEqual(data, { ok: true, is_senya });
}

describe(`POST ${apiUrl}`, () => {
  it("validation failed", async () => {
    assertValidationError(
      await tserver.post(apiUrl, { url: 123 }),
      'Validation error: Expected string, received number at "body.url"',
    );
    assertValidationError(
      await tserver.post(apiUrl, {}),
      'Validation error: Required at "body.url"',
    );
  });

  it("checkSenya returns Ok(true)", async () => {
    await checkOkSenya("ok_true", true);
    await checkOkSenya("    ok_true   ", true); // check url trim
  });

  it("checkSenya returns Ok(false)", async () => {
    await checkOkSenya("ok_false", false);
  });

  it("checkSenya returns Err", async () => {
    const res = await tserver.post(apiUrl, { url: "err" });
    assert.equal(res.statusCode, 200);
    const data = JSON.parse(res.body);
    assert.deepEqual(data, { ok: false, error: { message: "err", name: "StacklessError" } });
  });

  it("checkSenya throws error", async () => {
    assertServiceThrow(await tserver.post(apiUrl, { url: "throw" }), "unexpected error");
    assertServiceThrow(await tserver.post(apiUrl, { url: "throwEmpty" }));
  });

  it("body-parser throws error", async () => {
    const res = await tserver.post("/api/senya", "{ url: oops }");
    assert.equal(res.statusCode, 400);
    const data = JSON.parse(res.body);
    assert.deepEqual(data, {
      error: "Expected property name or '}' in JSON at position 2 (line 1 column 3)",
      status: 400,
    });
  });
});
