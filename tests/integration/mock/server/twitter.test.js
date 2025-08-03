import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { createServer } from "../../../../src/server/server.js";
import { Err, Ok } from "../../../../src/utils/result.js";
import { StacklessError } from "../../../../src/utils/stackless-error.js";
import { createLogManager } from "../../../utils/utils.js";
import {
  assertServiceReturnsErr,
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
  getTwitter: async (video) => {
    switch (video) {
      case "ok":
        return Ok({
          text: "text",
          images: ["image_url"],
          videos: [],
        });
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

const apiUrl = "/api/v1/twitter";

describe(`POST ${apiUrl}`, () => {
  it("validation failed", async () => {
    assertValidationError(
      await tserver.post(apiUrl, { id: 123 }),
      'Validation error: Expected string, received number at "body.id"',
    );
    assertValidationError(
      await tserver.post(apiUrl, {}),
      'Validation error: Required at "body.id"',
    );
  });

  it("service returns Ok", async () => {
    const res = await tserver.post(apiUrl, { id: "  ok  " });
    assert.equal(res.statusCode, 200);
    const data = JSON.parse(res.body);
    assert.deepEqual(data, {
      ok: true,
      value: { text: "text", images: ["image_url"], videos: [] },
    });
  });

  it("service returns Err", async () => {
    assertServiceReturnsErr(await tserver.post(apiUrl, { id: "err" }), "err", "StacklessError");
  });

  it("service throws error", async () => {
    assertServiceThrow(await tserver.post(apiUrl, { id: "throw" }), "unexpected error");
    assertServiceThrow(await tserver.post(apiUrl, { id: "throwEmpty" }));
  });
});
