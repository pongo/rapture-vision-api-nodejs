import assert from "node:assert/strict";
import { describe, it, test } from "node:test";
import {
  InstagramStoryScheme,
  SenyaScheme,
  Instagram2Scheme,
  Instagram1Scheme,
  ThreadsScheme,
  TwitterScheme,
  TiktokScheme,
} from "./validation.js";

test("valita schemes", () => {
  assert.throws(() => SenyaScheme.parse({}));
  assert.throws(() => Instagram1Scheme.parse({}));
  assert.throws(() => Instagram2Scheme.parse({}));
  assert.throws(() => InstagramStoryScheme.parse({}));
  assert.throws(() => ThreadsScheme.parse({}));
  assert.throws(() => TwitterScheme.parse({}));
  assert.throws(() => TiktokScheme.parse({}));

  assert.ok(SenyaScheme.try({ url: "https://example.com" }).ok);
  assert.ok(Instagram1Scheme.try({ url: "https://example.com" }).ok);
  assert.ok(Instagram2Scheme.try({ post_id: "123456" }).ok);
  assert.ok(InstagramStoryScheme.try({ url: "https://example.com" }).ok, "url ok");
  assert.ok(InstagramStoryScheme.try({ id: "123456" }).ok, "id ok");
  assert.ok(ThreadsScheme.try({ url: "https://example.com" }).ok);
  assert.ok(TwitterScheme.try({ id: "123456" }).ok);
  assert.ok(TiktokScheme.try({ video: "https://example.com" }).ok);
});

describe("Valita Schemas", function () {
  describe("SenyaScheme", function () {
    it("should accept valid objects with non-empty url", function () {
      const validData = { url: "http://example.com" };
      assert.deepEqual(SenyaScheme.parse(validData), validData);
    });

    it("should throw an error if url is empty", function () {
      const invalidData = { url: "   " };
      assert.throws(() => SenyaScheme.parse(invalidData), /empty/);
    });

    it("should throw an error if url is missing", function () {
      const invalidData = {};
      assert.throws(() => SenyaScheme.parse(invalidData), /url \(missing value\)/);
    });
  });

  describe("TiktokScheme Validation", () => {
    it("should pass with a valid video URL", () => {
      const result = TiktokScheme.try({ video: "https://tiktok.com/somevideo" });
      assert.equal(result.ok, true);
      assert.equal(result.value.video, "https://tiktok.com/somevideo");
    });

    it("should fail when video is an empty string", () => {
      const result = TiktokScheme.try({ video: " " });
      assert.equal(result.ok, false);
      assert.equal(result.message, "custom_error at .video (empty)");
    });

    it("should fail when video is missing", () => {
      const result = TiktokScheme.try({});
      assert.equal(result.ok, false);
    });
  });

  describe("Instagram1Scheme Validation", () => {
    it("should pass with a valid URL", () => {
      const result = Instagram1Scheme.try({ url: "https://instagram.com/post" });
      assert.equal(result.ok, true);
      assert.equal(result.value.url, "https://instagram.com/post");
    });

    it("should pass with a valid post_id", () => {
      const result = Instagram1Scheme.try({ post_id: "12345" });
      assert.equal(result.ok, true);
      assert.equal(result.value.post_id, "12345");
    });

    it("should fail when both url and post_id are missing", () => {
      const result = Instagram1Scheme.try({});
      assert.equal(result.ok, false);
      assert.equal(result.message, "custom_error at . (should be post_id or url)");
    });
  });
});
