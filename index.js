import "dotenv/config";
// dotenv must be first
import { createServer } from "./src/server/server.js";
import {
  createGetInstagram,
  getInstagramStory,
} from "./src/services/instagram/instagram-service.js";
import { getThreads } from "./src/services/threads-service.js";
import { createGetTiktok } from "./src/services/tiktok/tiktok-service.js";
import { createGetTwitter } from "./src/services/twitter/twitter-service.js";
import { Err } from "./src/utils/result.js";

const port = Number(process.env.PORT || 3000);

async function initCheckSenya() {
  if (process.env.DISABLE_CHECK_SENYA === "on") {
    return {
      checkSenya: async () => Err("checkSenya disabled by environment variable"),
    };
  }

  return await import("./src/services/senya/senya-service.js");
}

const app = createServer({
  getInstagram: createGetInstagram(),
  getInstagramStory,
  getThreads,
  getTiktok: createGetTiktok(),
  getTwitter: createGetTwitter(),
  checkSenya: await initCheckSenya(),
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
