"use strict";

const fg = require("fast-glob").sync;
const { spec, tap } = require("node:test/reporters");
const { run } = require("node:test");
const bail = require("@reporters/bail");

process.env.NODE_ENV = "test";

let files;
const source = ["src/**/*.js", "tests/**/*.test.js"];
const ignore = [
  "*/face-service.js",
  "*/senya-service.js",
  "**/*-service.js",
  // "src/services/tiktok/apis/index.js",
];

files = fg(source, { ignore });
// files = [`src/services/twitter/apis/index.js`];
// files = fg(["src/services/tiktok/apis/*.js"]);

// console.log(files);

const s = run({ files, concurrency: 3 }).on("test:fail", () => {
  process.exitCode = 1;
});

s.compose(bail).pipe(process.stderr);
s.compose(new spec()).pipe(process.stdout);
// s.compose(tap).pipe(process.stdout);
