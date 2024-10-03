"use strict";

const { test } = require("node:test");
const { Err } = require("../src/utils/result");
const { Balancer } = require("../src/utils/balancer");
const fs = require("node:fs");
const assert = require("node:assert/strict");

test.skip("keyv should create file with limits", async () => {
  const FILENAME = "keyv-test-limits.json";
  fs.existsSync(FILENAME) && fs.unlinkSync(FILENAME);

  const apis = [["fail", async () => Err("Fail", { remaining: 100, reset: 1 })]];
  const balancer = new Balancer({ name: "keyv-test", apis, shuffle: true, strategy: "last" });
  await balancer.callOneRound("test");

  assert.ok(fs.existsSync(FILENAME));
  const content = fs.readFileSync(FILENAME, "utf-8");
  // console.log(content);
  const data = JSON.parse(content);
  // console.dir(data, { depth: null });
  assert.equal(data.cache.length, 1);
  assert.equal(data.cache[0][0], "keyv:fail");
  assert.match(data.cache[0][1].value, /"value":100/);
  assert.match(data.cache[0][1].value, /"expires":/);

  fs.unlinkSync(FILENAME);
});
