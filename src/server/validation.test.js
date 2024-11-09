import requestMock from "express-request-mock";
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { createLogManager } from "../utils/testing-utils.js";
import {
  InstagramScheme,
  InstagramStoryScheme,
  SenyaScheme,
  ThreadsScheme,
  TiktokScheme,
  TwitterScheme,
  validate,
} from "./validation.js";

const logManager = createLogManager();

before(logManager.silent);
after(logManager.restore);

describe("validate() middleware", () => {
  it("should modify request object", async () => {
    const { request, response } = await requestMock(validate(SenyaScheme), {
      body: { url: "     https://example.com    " },
    });
    assert.equal(response.statusCode, 200);
    assert.deepEqual(request.safeData, { body: { url: "https://example.com" } });
  });

  it("should return an 400 error", async () => {
    const { response } = await requestMock(validate(SenyaScheme), {
      body: { url: "     " },
    });
    assert.equal(response.statusCode, 400);
    assert.deepEqual(response._getJSONData(), {
      error: {
        code: 400,
        message: 'Validation error: String must contain at least 1 character(s) at "body.url"',
      },
      ok: false,
    });
  });

  it("should catch unexpected errors", async () => {
    const call = () =>
      requestMock(
        validate({
          safeParse() {
            throw new Error("validation error");
          },
        }),
      );
    await assert.rejects(call, {
      name: "Error",
      message: "validation error",
    });
  });
});

describe("checkOneLineScheme", { plan: 1 }, async () => {
  checkOneLineScheme("SenyaScheme", SenyaScheme, "url");
  checkOneLineScheme("TiktokScheme", TiktokScheme, "video");
  checkOneLineScheme("ThreadsScheme", ThreadsScheme, "url");
  checkOneLineScheme("TwitterScheme", TwitterScheme, "id");
});

describe("InstagramScheme", () => {
  it("should accept valid input", async () => {
    await validateOk(InstagramScheme, { post_id: "12234" });
  });

  it("should return an error on wrong input", async () => {
    await validateError(
      InstagramScheme,
      { post_id: "      " },
      'Validation error: String must contain at least 1 character(s) at "body.post_id"',
    );
    await validateError(
      InstagramScheme,
      { post_id: 1 },
      'Validation error: Expected string, received number at "body.post_id"',
    );
    await validateError(InstagramScheme, {}, 'Validation error: Required at "body.post_id"');
  });
});

describe("InstagramStoryScheme", () => {
  it("should accept valid input", async () => {
    await validateOk(InstagramStoryScheme, { url: "https://example.com" });
    await validateOk(InstagramStoryScheme, { id: "12334" });
    await validateOk(InstagramStoryScheme, { url: "https://example.com", id: "12334" });
    await validateOk(InstagramStoryScheme, { url: "https://example.com", id: "" });
  });

  it("should return an error on wrong input", async () => {
    const errorMessage = 'Validation error: should be url or id at "body"';
    await validateError(InstagramStoryScheme, { url: "      " }, errorMessage);
    await validateError(InstagramStoryScheme, { id: "" }, errorMessage);
    await validateError(InstagramStoryScheme, { url: "      ", id: "" }, errorMessage);
    await validateError(InstagramStoryScheme, {}, errorMessage);
  });
});

async function validateOk(scheme, body) {
  const { response } = await requestMock(validate(scheme), { body });
  assert.equal(response.statusCode, 200);
}

async function validateError(scheme, body, errorMessage) {
  const { response } = await requestMock(validate(scheme), { body });
  assert.equal(response.statusCode, 400);
  assert.equal(response._getJSONData().error.message, errorMessage);
}

function checkOneLineScheme(schemeName, scheme, paramName) {
  describe(schemeName, () => {
    it("should accept valid input", async () => {
      await validateOk(scheme, { [paramName]: "non empty string" });
    });

    it("should return an error on wrong input", async () => {
      await validateError(
        scheme,
        { [paramName]: "      " },
        `Validation error: String must contain at least 1 character(s) at "body.${paramName}"`,
      );
      await validateError(
        scheme,
        { [paramName]: 1 },
        `Validation error: Expected string, received number at "body.${paramName}"`,
      );
      await validateError(scheme, {}, `Validation error: Required at "body.${paramName}"`);
    });
  });
}
