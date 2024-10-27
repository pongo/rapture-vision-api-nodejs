import assert from "node:assert/strict";
import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { test } from "node:test";
import { Balancer } from "../src/utils/balancer.js";
import { Err } from "../src/utils/result.js";

test.skip("keyv should create file with limits", async () => {
  const FILENAME = "keyv-test-limits.json";
  existsSync(FILENAME) && unlinkSync(FILENAME);

  const apis = [["fail", async () => Err("Fail", { remaining: 100, reset: 1 })]];
  const balancer = new Balancer({ name: "keyv-test", apis, shuffle: true, strategy: "last" });
  await balancer.callOneRound("test");

  assert.ok(existsSync(FILENAME));
  const content = readFileSync(FILENAME, "utf-8");
  // console.log(content);
  const data = JSON.parse(content);
  // console.dir(data, { depth: null });
  assert.equal(data.cache.length, 1);
  assert.equal(data.cache[0][0], "keyv:fail");
  assert.match(data.cache[0][1].value, /"value":100/);
  assert.match(data.cache[0][1].value, /"expires":/);

  unlinkSync(FILENAME);
});
