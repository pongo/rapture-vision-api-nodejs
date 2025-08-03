/* eslint-disable no-unused-vars */
import "dotenv/config";
//
import { setTimeout as delay } from "node:timers/promises";

await main().catch(console.error);

async function main() {
  // await tiktok();
  // await twitter();
  await instagram();

  // await analyticsTest();

  // await twitterService();
  // await tiktokService();
  // await instagramService();
}

async function instagram() {
  const apis = await import("./src/services/instagram/apis/npm-libs.js");
  // const apis = await import("./src/services/instagram/apis/rapidapis.js");

  const image = "Cf4PRxnlMUa";
  const image2 = "DAN98w7zs0j";
  const image_and_video = "CnpKCjYPyd6";
  const video = "ClYitVwDnJ-";
  const video2 = "CmOBTkvjJs1";
  const multiple_videos = "ClwKf74ywve";
  const multiple_images = "CXJdPfRgFl8";

  const loadFromDisk = true;
  console.log(
    await apis.fetchMetadownloader(image, {
      loadFromDisk,
      saveToDisk: !loadFromDisk,
    }),
  );
}

async function twitterService() {
  const { createGetTwitter } = await import("./src/services/twitter/twitter-service.js");
  const getTwitter = createGetTwitter(undefined, { loadFromDisk: true });

  console.dir(await getTwitter("1748738014690304393"), { depth: null });
}

async function tiktokService() {
  const { createGetTiktok } = await import("./src/services/tiktok/tiktok-service.js");
  const getTiktok = createGetTiktok(undefined, { loadFromDisk: true });

  console.log(await getTiktok("https://vt.tiktok.com/ZSNwYG2DD/"));
}

async function instagramService() {
  const { createGetInstagram } = await import("./src/services/instagram/instagram-service.js");
  const getInstagram = createGetInstagram(undefined, { loadFromDisk: true });

  console.log(await getInstagram("CnpKCjYPyd6="));
}

async function analyticsTest() {
  const { CsvWriter } = await import("./src/analytics/csv-writer.js");

  const csv = new CsvWriter("analytics-test.csv", "header");
  csv.writeRow("1");
}

async function tiktok() {
  const apis = await import("./src/services/tiktok/apis/npm-libs.js");
  // const apis = await import("./src/services/tiktok/apis/rapidapis.js");

  const fail = "https://vm.tiktok.com/ZSjZpJ/";
  const ok = "https://www.tiktok.com/@andakitty/video/7295937209176214816";
  const ok2 = "https://vt.tiktok.com/ZSNwYG2DD/";
  const ok3 = "https://www.tiktok.com/@netleya/video/7070543692007787777";

  const loadFromDisk = false;
  console.log(
    await apis.fetchNayan(ok3, {
      loadFromDisk,
      saveToDisk: !loadFromDisk,
    }),
  );

  // console.log(await getTiktok(ok2));
  // require("node:child_process").exec(`notifu /m "tests" /d 2000`);
}

async function twitter() {
  const twitterApis = await import("./src/services/twitter/apis/rapidapis.js");
  const { getTwitter } = await import("./src/services/twitter/twitter-service.js");

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
      await twitterApis.fetchAbcdsxg1TweetResultByRestId(id, {
        loadFromDisk,
        saveToDisk: !loadFromDisk,
      }),
    );
    await delay(1000);
  }
}
