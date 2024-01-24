"use strict";
const fs = require("node:fs/promises");

async function loadJson(path) {
  return JSON.parse(await fs.readFile(path, "utf-8"));
}

module.exports = { loadJson };
