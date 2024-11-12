import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { createServer } from "../../../src/server/server.js";
import { Err, Ok } from "../../../src/utils/result.js";
import { StacklessError } from "../../../src/utils/stackless-error.js";
import { createLogManager } from "../../../src/utils/testing-utils.js";
import {
  assertServiceReturnsErr,
  assertServiceThrow,
  assertValidationError,
  notImplementedServerConfig,
  ServerTest,
} from "../../../src/utils/testing/server.js";

const logManager = createLogManager();

before(logManager.silent);
after(logManager.restore);

const app = createServer({
  ...notImplementedServerConfig,
  getTiktok: async (video) => {
    switch (video) {
      case "ok":
        return Ok({
          videos: ["video_url"],
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

const apiUrl = "/api/v1/tiktok-video";

describe(`POST ${apiUrl}`, () => {
  it("validation failed", async () => {
    assertValidationError(
      await tserver.post(apiUrl, { video: 123 }),
      'Validation error: Expected string, received number at "body.video"',
    );
    assertValidationError(
      await tserver.post(apiUrl, {}),
      'Validation error: Required at "body.video"',
    );
  });

  it("service returns Ok", async () => {
    const res = await tserver.post(apiUrl, { video: "  ok  " });
    assert.equal(res.statusCode, 200);
    const data = JSON.parse(res.body);
    assert.deepEqual(data, { ok: true, value: { videos: ["video_url"] } });
  });

  it("service returns Err", async () => {
    assertServiceReturnsErr(await tserver.post(apiUrl, { video: "err" }), "err");
  });

  it("service throws error", async () => {
    assertServiceThrow(await tserver.post(apiUrl, { video: "throw" }), "unexpected error");
    assertServiceThrow(await tserver.post(apiUrl, { video: "throwEmpty" }));
  });
});
