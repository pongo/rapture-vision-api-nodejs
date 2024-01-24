"use strict";
const fs = require("node:fs/promises");
const { suite } = require("uvu");

async function loadJson(path) {
  return JSON.parse(await fs.readFile(path, "utf-8"));
}

// https://github.com/lukeed/uvu/issues/43#issuecomment-740817223
function describe(title, fn) {
  const it = suite(title);
  fn(it);
  it.run();
}

module.exports = { loadJson, describe };
