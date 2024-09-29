"use strict";

const reShortVM = /(?:v.)\.tiktok\.com\/(\w+?)(?:\/|\?|$)/i;
const reShortT = /tiktok\.com\/(?:t\/)(\w+?)(?:\/|\?|$)/i;
const reWithUsername = /tiktok\.com\/@([\w.-]+)(?:\/video\/|\/.*item_id=)([\d]+)/i;
const reId = /(?:\/|\?shareId=|\&item_id=)(\d+)/i;

/**
 * @param {string} url
 * @returns {({ shortcode: string; id?: never; username?: never } | { username?: string; id: string; shortcode?: never })}
 */
function parseTiktokUrl(url) {
  return (
    parseShort(url, reShortVM) ||
    parseShort(url, reShortT) ||
    parseWithUsername(url) ||
    parseId(url)
  );
}

function parseShort(url, re) {
  const match = url.match(re);
  return match ? { shortcode: match[1] } : undefined;
}

function parseWithUsername(url) {
  const match = url.match(reWithUsername);
  return match ? { username: match[1], id: match[2] } : undefined;
}

function parseId(url) {
  const match = url.match(reId);
  return match ? { id: match[1] } : undefined;
}

if (process.env.NODE_ENV === "test" && require.main === module) {
  const assert = require("node:assert/strict");
  const { describe, it } = require("node:test");

  describe("parseTiktokUrl()", () => {
    it("should parse shortcode", () => {
      assert.equal(parseTiktokUrl("https://vm.tiktok.com//"), undefined);

      s("https://vm.tiktok.com/ZSjZpJ/", "ZSjZpJ");
      s("https://vt.tiktok.com/ZSjZpJ/", "ZSjZpJ");
      s("vm.tiktok.com/ZSjZpJ/", "ZSjZpJ");
      s("https://vt.tiktok.com/ZSNmRFp2v/", "ZSNmRFp2v");

      s("https://www.tiktok.com/t/ZSNba2R1p/", "ZSNba2R1p");
      s("https://tiktok.com/t/ZSNba2R1p/", "ZSNba2R1p");
      s("tiktok.com/t/ZSNba2R1p/", "ZSNba2R1p");

      function s(url, shortcode) {
        assert.deepEqual(parseTiktokUrl(url), { shortcode });
      }
    });

    it("should parse url with username", () => {
      u(
        "https://www.tiktok.com/@andakitty/video/7295937209176214816",
        "andakitty",
        "7295937209176214816",
      );

      u(
        `https://m.tiktok.com/@cchelseameow/video/6751181801206729990`,
        `cchelseameow`,
        `6751181801206729990`,
      );
      u(
        `https://m.tiktok.com/@jd777777_78/video/7103185591575088411?is_from_webapp=1&sender_device=pc`,
        `jd777777_78`,
        `7103185591575088411`,
      );
      u(
        `https://m.tiktok.com/@jd77777778/video/7103185591575088411?is_from_webapp=1&sender_device=pc`,
        `jd77777778`,
        `7103185591575088411`,
      );
      u(
        `https://tiktok.com/@scout2015/video/6718335390845095173`,
        `scout2015`,
        `6718335390845095173`,
      );
      u(
        `https://www.tiktok.com/@.0_kurvaaaaaa_/video/7145028763900742918?_r=1&u_code=dc680ide8i5h7j&preview_pb=0&language=ru&_d=dc680k59259kgm&share_item_id=7145028763900742918&source=h5_m&timestamp=1663690435&user_id=6821497924985078790&sec_user_id=MS4wLjABAAAA17IASeCEeo_U1YYd5EUAVIA6zsrbiIZp3uA9rjrXE9A3Y_2EZb_c9Cs9FYTfnNYd&utm_source=copy&utm_campaign=client_share&utm_medium=android&share_iid=7143887884801902337&share_link_id=db3d749f-da25-426e-be80-39cb62557513&share_app_id=1233&ugbiz_name=Main&ug_btm=b8727%2Cb2878`,
        `.0_kurvaaaaaa_`,
        `7145028763900742918`,
      );
      u(
        `https://www.tiktok.com/@burntpizza89/video/7067695578729221378?is_copy_url=1&is_from_webapp=v1`,
        `burntpizza89`,
        `7067695578729221378`,
      );
      u(
        `https://www.tiktok.com/@burntpizza89/video/is_copy_url=1&is_from_webapp=v1&item_id=70676955787292213`,
        `burntpizza89`,
        `70676955787292213`,
      );
      u(
        `https://www.tiktok.com/@burntpizza89/video/is_copy_url=1&is_from_webapp=v1&item_id=7067695578729221378`,
        `burntpizza89`,
        `7067695578729221378`,
      );
      u(
        `https://www.tiktok.com/@cchelseam..eow_/video/6751181801206729990`,
        `cchelseam..eow_`,
        `6751181801206729990`,
      );
      u(
        `https://www.tiktok.com/@cchelseameow/video/6751181801206729990`,
        `cchelseameow`,
        `6751181801206729990`,
      );
      u(
        `https://www.tiktok.com/@jd77777778/video/7103185591575088411?is_from_webapp=1&sender_device=pc`,
        `jd77777778`,
        `7103185591575088411`,
      );
      u(
        `https://www.tiktok.com/@madamhlebyshek/video/7316099630578666754?is_from_webapp=1&sender_device=pc`,
        `madamhlebyshek`,
        `7316099630578666754`,
      );

      function u(url, username, id) {
        assert.deepEqual(parseTiktokUrl(url), { username, id });
      }
    });

    it("should parse id", () => {
      i(`https://m.tiktok.com/h5/share/usr/6641141594707361797.html`, `6641141594707361797`);
      i(`https://m.tiktok.com/v/6749869095467945218`, `6749869095467945218`);
      i(`https://m.tiktok.com/v/6749869095467945218.html`, `6749869095467945218`);
      i(`https://tiktok.com/embed/6567659045795758085`, `6567659045795758085`);
      i(`https://www.tiktok.com/embed/6567659045795758085`, `6567659045795758085`);
      i(
        `https://www.tiktok.com/foryou?is_copy_url=1&is_from_webapp=v1&item_id=7103185591575088411`,
        `7103185591575088411`,
      );
      i(
        `https://www.tiktok.com/foryou?is_copy_url=1&is_from_webapp=v1&item_id=7103185591575088411#/@jd77777778/video/7103185591575088411`,
        `7103185591575088411`,
      );
      i(`https://www.tiktok.com/share/user/6567659045795758085`, `6567659045795758085`);
      i(`https://www.tiktok.com/trending?shareId=6744531482393545985`, `6744531482393545985`);
      i(`https://www.tiktok.com/v/6749869095467945218`, `6749869095467945218`);
      i(`https://www.tiktok.com/v/6749869095467945218.html`, `6749869095467945218`);

      function i(url, id) {
        assert.deepEqual(parseTiktokUrl(url), { id });
      }
    });

    it("should parse all these urls", () => {
      const urls = `
https://m.tiktok.com/@cchelseameow/video/6751181801206729990
https://m.tiktok.com/@jd777777_78/video/7103185591575088411?is_from_webapp=1&sender_device=pc
https://m.tiktok.com/@jd77777778/video/7103185591575088411?is_from_webapp=1&sender_device=pc
https://m.tiktok.com/h5/share/usr/6641141594707361797.html
https://m.tiktok.com/v/6749869095467945218
https://m.tiktok.com/v/6749869095467945218.html
https://tiktok.com/@scout2015/video/6718335390845095173
https://tiktok.com/embed/6567659045795758085
https://vm.tiktok.com/ZMF6rgvXY/
https://vm.tiktok.com/ZSjZpJ/
https://vt.tiktok.com/ZSNmRFp2v/
https://www.tiktok.com/@.0_kurvaaaaaa_/video/7145028763900742918?_r=1&u_code=dc680ide8i5h7j&preview_pb=0&language=ru&_d=dc680k59259kgm&share_item_id=7145028763900742918&source=h5_m&timestamp=1663690435&user_id=6821497924985078790&sec_user_id=MS4wLjABAAAA17IASeCEeo_U1YYd5EUAVIA6zsrbiIZp3uA9rjrXE9A3Y_2EZb_c9Cs9FYTfnNYd&utm_source=copy&utm_campaign=client_share&utm_medium=android&share_iid=7143887884801902337&share_link_id=db3d749f-da25-426e-be80-39cb62557513&share_app_id=1233&ugbiz_name=Main&ug_btm=b8727%2Cb2878
https://www.tiktok.com/@burntpizza89/video/7067695578729221378?is_copy_url=1&is_from_webapp=v1
https://www.tiktok.com/@burntpizza89/video/is_copy_url=1&is_from_webapp=v1&item_id=70676955787292213
https://www.tiktok.com/@burntpizza89/video/is_copy_url=1&is_from_webapp=v1&item_id=7067695578729221378
https://www.tiktok.com/@cchelseam..eow_/video/6751181801206729990
https://www.tiktok.com/@cchelseameow/video/6751181801206729990
https://www.tiktok.com/@jd77777778/video/7103185591575088411?is_from_webapp=1&sender_device=pc
https://www.tiktok.com/@madamhlebyshek/video/7316099630578666754?is_from_webapp=1&sender_device=pc
https://www.tiktok.com/embed/6567659045795758085
https://www.tiktok.com/foryou?is_copy_url=1&is_from_webapp=v1&item_id=7103185591575088411
https://www.tiktok.com/foryou?is_copy_url=1&is_from_webapp=v1&item_id=7103185591575088411#/@jd77777778/video/7103185591575088411
https://www.tiktok.com/share/user/6567659045795758085
https://www.tiktok.com/t/ZSNba2R1p/
https://www.tiktok.com/trending?shareId=6744531482393545985
https://www.tiktok.com/v/6749869095467945218
https://www.tiktok.com/v/6749869095467945218.html
      `
        .trim()
        .split("\n");

      for (const url of urls) {
        assert.ok(parseTiktokUrl(url), url);
      }
    });
  });
}

module.exports = { parseTiktokUrl };
