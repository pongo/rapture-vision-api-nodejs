"use strict";

const assert = require("node:assert/strict");
const { describe, it } = require("node:test");
const { apis } = require(".");

const tweets = {
  // long text.
  // https://twitter.com/TwitterSupport/status/1679529814212894723
  "1679529814212894723": {
    text: "Starting as soon as July 14th, we’re adding a new messages setting that should help reduce the number of spam messages in DMs. With the new setting enabled, messages from users who you follow will arrive in your primary inbox, and messages from verified users who you don’t follow…",
    images: [],
    videos: [],
  },

  // 1 image.
  // https://twitter.com/peterbyrzhenka/status/1677672844803682307
  "1677672844803682307": {
    text: "внимание\n\nнаша ключница\n\nспасибо за внимание https://t.co/AEdt2Yfswy",
    images: ["https://pbs.twimg.com/media/F0hKjm0WwAEWB5n.jpg"],
    videos: [],
  },

  // 2 images.
  // https://twitter.com/hungryfishxuan/status/1679584086577549312
  "1679584086577549312": {
    text: "Это могли бы быть мы, но слава архонтам, нет, потому что с луком в качестве оружия я бы бросила геншин в первый же день игры https://t.co/ynKzkd88uN",
    images: [
      "https://pbs.twimg.com/media/F08U0o4WcAAyUKN.jpg",
      "https://pbs.twimg.com/media/F08U0ygWIAIPdBq.jpg",
    ],
    videos: [],
  },

  // gif.
  // https://twitter.com/TheOtaking/status/1637200370207281152
  "1637200370207281152": {
    text: "The King of Fighters XIII - SNK Playmore - Arcade - 2010\n\nhttps://t.co/tRVVQfFvcA",
    images: [],
    videos: [["https://video.twimg.com/tweet_video/DMAIT_WVwAAwzWl.mp4"]],
  },

  // video + image.
  // https://twitter.com/Royals/status/1564019746521202693
  "1564019746521202693": {
    text: "The only way to cool us down today.\n\n#TogetherRoyal https://t.co/YoKIZygDb1",
    images: ["https://pbs.twimg.com/media/FbSDoQQWYAY-Mm5.jpg"],
    videos: [
      [
        "https://video.twimg.com/ext_tw_video/1564019698181840903/pu/vid/720x900/amEgyF6qV50fdTwN.mp4?tag=12",
        "https://video.twimg.com/ext_tw_video/1564019698181840903/pu/vid/480x600/ZTU99CCA3-kxrNxJ.mp4?tag=12",
        "https://video.twimg.com/ext_tw_video/1564019698181840903/pu/vid/320x400/IJKTztFE_TAfb0I7.mp4?tag=12",
      ],
    ],
  },

  // некорневое gif + image. with alts.
  // https://twitter.com/TwitterSupport/status/1577730112853680128
  "1577730112853680128": {
    text: "Create a whole vibe https://t.co/BDFnwC0pn9",
    images: ["https://pbs.twimg.com/media/FeU5Kx8UcAE7qcB.jpg"],
    videos: [["https://video.twimg.com/tweet_video/FeU5Kx9UYAEa_Fm.mp4"]],
  },

  // 4 videos. https://twitter.com/jasmin_herrero/status/1676700862935072769
  "1676700862935072769": {
    text: '💚💜 JINKOOK 💜💚\n"When JUNGKOOK marking his territory-1 😝😛😝😁😁✌️✌️"\n#jinkook #kookjin\n#jinkook_my_everything \n#kookjin_my_everything \n videos ctto https://t.co/bCR2DLWKtX',
    images: [],
    videos: [
      [
        "https://video.twimg.com/ext_tw_video/1676700690196955136/pu/vid/1080x602/8UEPWpQ0DijdURCl.mp4?tag=12",
        "https://video.twimg.com/ext_tw_video/1676700690196955136/pu/vid/644x360/x7T8p0te9b7O85Tt.mp4?tag=12",
        "https://video.twimg.com/ext_tw_video/1676700690196955136/pu/vid/484x270/zwZTI6mbxUOX5LuY.mp4?tag=12",
      ],
      [
        "https://video.twimg.com/ext_tw_video/1676700742785040384/pu/vid/1080x604/HJPHrowsDe_HrI6u.mp4?tag=12",
        "https://video.twimg.com/ext_tw_video/1676700742785040384/pu/vid/642x360/BWIyFtgr54T-Uf7V.mp4?tag=12",
        "https://video.twimg.com/ext_tw_video/1676700742785040384/pu/vid/482x270/5An0qxWtmSmkxvkn.mp4?tag=12",
      ],
      [
        "https://video.twimg.com/ext_tw_video/1676700799143931904/pu/vid/368x656/b2fqqgwYSmVy2Iig.mp4?tag=12",
        "https://video.twimg.com/ext_tw_video/1676700799143931904/pu/vid/320x570/HDZBzxSvIUp8uWZl.mp4?tag=12",
      ],
      [
        "https://video.twimg.com/ext_tw_video/1676700824754429957/pu/vid/720x838/znJxgmnezYRjhdBW.mp4?tag=12",
        "https://video.twimg.com/ext_tw_video/1676700824754429957/pu/vid/480x558/QNgQM1qmdeMnf84J.mp4?tag=12",
        "https://video.twimg.com/ext_tw_video/1676700824754429957/pu/vid/320x372/l43R_RXcD-ialmeP.mp4?tag=12",
      ],
    ],
  },

  // quoted photo https://twitter.com/petite_michelle/status/1748738014690304393
  "1748738014690304393": {
    text: /^Take a picture that proves you’re not/,
    images: [
      "https://pbs.twimg.com/media/GETD9C1WcAAkTvP.jpg",
      "https://pbs.twimg.com/media/GER8rPtbEAANEXA.jpg",
    ],
    videos: [],
  },
};

describe("twitter apis", () => {
  const skip = new Set(["fetchGlavier135TweetDetail", "fetchRestocked47"]);
  for (const [name, twitterFetchFn] of apis) {
    if (skip.has(name)) {
      console.log("skip ", name);
      continue;
    }
    testTwitter(name, twitterFetchFn);
  }
});

function testTwitter(name, twitterFetchFn) {
  describe(name, () => {
    for (const [id, expected] of Object.entries(tweets)) {
      // if (id !== "1748738014690304393") continue;
      it(id, async () => {
        const actual = await twitterFetchFn(id, { loadFromDisk: true });
        assert.ok(actual.isOk, actual.error);
        delete actual.value.reset;
        delete actual.value.remaining;
        if (expected.text instanceof RegExp) {
          assert.match(actual.value.text, expected.text);
        } else {
          assert.deepEqual(actual.value.text, expected.text);
        }
        assert.deepEqual(actual.value.images, expected.images, "images");
        assert.deepEqual(actual.value.videos, expected.videos, "videos");
      });
    }
  });
}
