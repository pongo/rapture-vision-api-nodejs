"use strict";

const tiktokApis = require("../src/services/tiktok/apis/npm-libs");
// const tiktokApis = require("../src/services/tiktok/apis/rapidapis");
// const { getTiktok } = require("../src/tiktok-service");

if (require.main === module && process.env.NODE_ENV !== "test") {
  require("dotenv").config();
  tiktok().catch(console.error);
}

async function tiktok() {
  const fail = "https://vm.tiktok.com/ZSjZpJ/";
  const ok = "https://www.tiktok.com/@andakitty/video/7295937209176214816";
  const ok2 = "https://vt.tiktok.com/ZSNwYG2DD/";

  const loadFromDisk = false;
  console.log(
    await tiktokApis.fetchSmth(ok2, {
      loadFromDisk,
      saveToDisk: !loadFromDisk,
    }),
  );

  // console.log(await getTiktok(ok2));
  // require("node:child_process").exec(`notifu /m "tests" /d 2000`);
}
