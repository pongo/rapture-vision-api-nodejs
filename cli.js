"use strict";

require("dotenv").config();
const delay = require("node:timers/promises").setTimeout;

async function main() {
  // await tiktok();
  // await twitter();
  // getTwitter("1679529814212894723").then(console.log);
  // await analyticsTest();
  await tiktokService();
}

main().catch(console.error);

async function tiktokService() {
  const { getTiktok } = require("./src/services/tiktok-service");

  console.log(await getTiktok("https://vt.tiktok.com/ZSNwYG2DD/"));
}

async function analyticsTest() {
  const { CsvWriter } = require("./src/analytics/csv-writer");

  const csv = new CsvWriter("analytics-test.csv", "header");
  csv.writeRow("1");
}

async function tiktok() {
  const tiktokApis = require("./src/services/tiktok/apis/npm-libs");
  // const tiktokApis = require("./src/services/tiktok/apis/rapidapis");

  const fail = "https://vm.tiktok.com/ZSjZpJ/";
  const ok = "https://www.tiktok.com/@andakitty/video/7295937209176214816";
  const ok2 = "https://vt.tiktok.com/ZSNwYG2DD/";
  const ok3 = "https://www.tiktok.com/@netleya/video/7070543692007787777";

  const loadFromDisk = false;
  console.log(
    await tiktokApis.fetchTiktokScraperNowatermarks(ok3, {
      loadFromDisk,
      saveToDisk: !loadFromDisk,
    }),
  );

  // console.log(await getTiktok(ok2));
  // require("node:child_process").exec(`notifu /m "tests" /d 2000`);
}

async function twitter() {
  const twitterApis = require("./src/services/twitter/apis/rapidapis");
  const { getTwitter } = require("./src/services/twitter-service");

  const ids = ["1679529814212894723"];
  const ids2 = [
    // "1677672844803682307",
    // "1679584086577549312",
    // "1637200370207281152",
    // "1564019746521202693",
    // "1577730112853680128",
    // "1676700862935072769",
    "1748738014690304393",
  ];
  // "1748659643356955026",

  const loadFromDisk = false;
  for (const id of ids2) {
    console.log(
      await twitterApis.fetchSmth(id, {
        loadFromDisk,
        saveToDisk: !loadFromDisk,
      }),
    );
    await delay(1000);
  }
}
