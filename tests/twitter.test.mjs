import { suite } from "uvu";
import * as assert from "uvu/assert";
import { parseConversation, parseGlavierTweet } from "../src/services/twitter/twitter-apis.js";
import { loadJson } from "./utils.mjs";

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

  // quoted video. https://twitter.com/dm7mnn/status/1687020757249822721
  "1687020757249822721": {
    text: "пов: ты сидишь в баре хроники и арсений бабушкин приносит тебе очередную стопку кизлярки",
    images: [],
    videos: [
      [
        "https://video.twimg.com/ext_tw_video/1685986657642618880/pu/vid/606x1080/ykhraq8BxNEnPPQu.mp4?tag=12",
        "https://video.twimg.com/ext_tw_video/1685986657642618880/pu/vid/480x854/jbzl5K3orS_6oXZQ.mp4?tag=12",
        "https://video.twimg.com/ext_tw_video/1685986657642618880/pu/vid/320x570/hLnVjjrtkrkCEiuV.mp4?tag=12",
      ],
    ],
  },
};

for (const [id, expected] of Object.entries(tweets)) {
  const test = suite(id);

  test("Glavier/Tweet", async () => {
    assert.equal(
      parseGlavierTweet(await loadJson(`./tmp/twitter/Glavier/Tweet/${id}.json`)),
      expected
    );
  });

  test("restocked/tweet-details", async () => {
    assert.equal(
      parseConversation(id, await loadJson(`./tmp/twitter/restocked/tweet-details/${id}.json`)),
      expected
    );
  });

  test.run();
}
