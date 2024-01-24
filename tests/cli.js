"use strict";

// const tiktokApis = require("../src/services/tiktok/apis/npm-libs");
const tiktokApis = require("../src/services/tiktok/apis/rapidapis");

if (require.main === module && process.env.NODE_ENV !== "test") {
  require("dotenv").config();
  tiktok().catch(console.error);
}

async function tiktok() {
  const fail = "https://vm.tiktok.com/ZSjZpJ/";
  const ok = "https://www.tiktok.com/@andakitty/video/7295937209176214816";
  const ok2 = "https://vt.tiktok.com/ZSNwYG2DD/";

  const load = false;
  console.log(
    await tiktokApis.fetchSmth(ok2, {
      loadFromDisk: load,
      saveToDisk: !load,
    })
  );
  // require("node:child_process").exec(`notifu /m "tests" /d 2000`);
}
