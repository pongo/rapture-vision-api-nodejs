"use strict";

const delay = require("node:timers/promises").setTimeout;
const tiktokApis = require("../src/services/tiktok/apis/npm-libs");
// const tiktokApis = require("../src/services/tiktok/apis/rapidapis");
// const { getTiktok } = require("../src/services/tiktok-service");
const twitterApis = require("../src/services/twitter/apis/rapidapis");
const { getTwitter } = require("../src/services/twitter-service");

if (require.main === module && process.env.NODE_ENV !== "test") {
  require("dotenv").config();
  tiktok().catch(console.error);
  // twitter().catch(console.error);
  // getTwitter("1679529814212894723").then(console.log);
}

async function tiktok() {
  const fail = "https://vm.tiktok.com/ZSjZpJ/";
  const ok = "https://www.tiktok.com/@andakitty/video/7295937209176214816";
  const ok2 = "https://vt.tiktok.com/ZSNwYG2DD/";

  const loadFromDisk = false;
  console.log(
    await tiktokApis.fetchTobyg74_v2(ok2, {
      loadFromDisk,
      saveToDisk: !loadFromDisk,
    }),
  );

  // console.log(await getTiktok(ok2));
  // require("node:child_process").exec(`notifu /m "tests" /d 2000`);
}

async function twitter() {
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
