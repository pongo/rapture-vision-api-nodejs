import assert from "node:assert/strict";
import { describe, it } from "node:test";
import requestMock from "express-request-mock";
import {
  InstagramStoryScheme,
  SenyaScheme,
  Instagram2Scheme,
  Instagram1Scheme,
  ThreadsScheme,
  TwitterScheme,
  TiktokScheme,
  validate,
} from "./validation.js";

describe("validate() middleware", () => {
  it("should modify request object", async function () {
    const { request, response } = await requestMock(validate(SenyaScheme), {
      body: { url: "     https://example.com    " },
    });
    assert.equal(response.statusCode, 200);
    assert.deepEqual(request.validatedBody, { url: "https://example.com" });
  });

  it("should return an 400 error", async function () {
    const { response } = await requestMock(validate(SenyaScheme), {
      body: { url: "     " },
    });
    assert.equal(response.statusCode, 400);
    assert.deepEqual(response._getJSONData(), {
      error: {
        code: 400,
        message: 'Validation error: String must contain at least 1 character(s) at "url"',
      },
      ok: false,
    });
  });

  it("should catch unexpected errors", async function () {
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

checkOneLineScheme("SenyaScheme", SenyaScheme, "url");
checkOneLineScheme("TiktokScheme", TiktokScheme, "video");
checkOneLineScheme("ThreadsScheme", ThreadsScheme, "url");
checkOneLineScheme("TwitterScheme", TwitterScheme, "id");

describe("Instagram1Scheme", function () {
  it("should accept valid input", async function () {
    await validateOk(Instagram1Scheme, { url: "https://example.com" });
    await validateOk(Instagram1Scheme, { post_id: "12334" });
    await validateOk(Instagram1Scheme, { url: "https://example.com", post_id: "12334" });
    await validateOk(Instagram1Scheme, { url: "https://example.com", post_id: "" });
  });

  it("should return an error on wrong input", async function () {
    const errorMessage = "Validation error: should be post_id or url";
    await validateError(Instagram1Scheme, { url: "      " }, errorMessage);
    await validateError(Instagram1Scheme, { post_id: "" }, errorMessage);
    await validateError(Instagram1Scheme, { url: "      ", post_id: "" }, errorMessage);
    await validateError(Instagram1Scheme, {}, errorMessage);
  });
});

describe("Instagram2Scheme", function () {
  it("should accept valid input", async function () {
    await validateOk(Instagram2Scheme, { post_id: "12234" });
  });

  it("should return an error on wrong input", async function () {
    await validateError(
      Instagram2Scheme,
      { post_id: "      " },
      'Validation error: String must contain at least 1 character(s) at "post_id"',
    );
    await validateError(
      Instagram2Scheme,
      { post_id: 1 },
      'Validation error: Expected string, received number at "post_id"',
    );
    await validateError(Instagram2Scheme, {}, 'Validation error: Required at "post_id"');
  });
});

describe("InstagramStoryScheme", function () {
  it("should accept valid input", async function () {
    await validateOk(InstagramStoryScheme, { url: "https://example.com" });
    await validateOk(InstagramStoryScheme, { id: "12334" });
    await validateOk(InstagramStoryScheme, { url: "https://example.com", id: "12334" });
    await validateOk(InstagramStoryScheme, { url: "https://example.com", id: "" });
  });

  it("should return an error on wrong input", async function () {
    const errorMessage = "Validation error: should be url or id";
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
    it("should accept valid input", async function () {
      await validateOk(scheme, { [paramName]: "non empty string" });
    });

    it("should return an error on wrong input", async function () {
      await validateError(
        scheme,
        { [paramName]: "      " },
        `Validation error: String must contain at least 1 character(s) at "${paramName}"`,
      );
      await validateError(
        scheme,
        { [paramName]: 1 },
        `Validation error: Expected string, received number at "${paramName}"`,
      );
      await validateError(scheme, {}, `Validation error: Required at "${paramName}"`);
    });
  });
}
