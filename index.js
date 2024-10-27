import "dotenv/config";
import express from "express";
import {
  getInstagram,
  getInstagram_v1,
  getInstagramStory,
} from "./src/services/instagram/instagram-service.js";
import { getThreads } from "./src/services/threads-service.js";
import { getTiktok } from "./src/services/tiktok/tiktok-service.js";
import { getTwitter } from "./src/services/twitter/twitter-service.js";
import { Err } from "./src/utils/result.js";
import { timeStart } from "./src/utils/time-start.js";
const { checkSenya } = await initCheckSenya();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post("/api/senya", async (req, res) => {
  const url = req.body?.url?.trim();
  if (!url) {
    return void res.status(400).json({ ok: false, error: { code: 400, message: "Url is empty" } });
  }

  const elapsed = timeStart();
  const senyaResult = await checkSenya(url);
  if (senyaResult.isErr) {
    console.error(`checkSenya error: ${senyaResult.error.message}, elapsed: ${elapsed()} ms`);
    return void res.json({ ok: false, error: senyaResult.error });
  }

  console.log(`${senyaResult.value ? "Yes" : "Not"} senya in ${elapsed()} ms ${url}`);
  res.json({ ok: true, is_senya: senyaResult.value });
});

app.post("/api/v1/tiktok-video", async (req, res) => {
  const { video: videoUrl } = req.body;

  if (typeof videoUrl !== "string") {
    return void res
      .status(400)
      .json({ ok: false, error: { code: 400, message: "'video' is not a string" } });
  }

  const elapsed = timeStart();
  const result = await getTiktok(videoUrl);
  if (result.isErr) {
    const message = result.error?.message ?? result.error;
    console.error(`tiktokVideo '${videoUrl}' error: ${message}, elapsed: ${elapsed()} ms`);
    return void res.status(500).json({ ok: false, error: { code: 500, message } });
  }

  console.info(`Fetched tiktok video in ${elapsed()} ms ${videoUrl}`);
  res.json({ ok: true, value: result.value });
});

app.post("/api/v1/instagram", async (req, res) => {
  const url = req.body?.url?.trim();
  const post_id = req.body?.post_id?.trim();
  if (!url && !post_id) {
    return void res
      .status(400)
      .json({ ok: false, error: { code: 400, message: "Should be url or post_id" } });
  }

  const elapsed = timeStart();
  const igResult = await getInstagram_v1({ post_id, url });
  if (igResult.isErr) {
    console.error(`/instagram error: ${igResult.error.message}, elapsed: ${elapsed()} ms`);
    return void res.json({ ok: false, error: igResult.error });
  }

  console.log(
    `Fetched instagram. ${igResult.value.length} links found in ${elapsed()} ms ${post_id} ${url}`,
  );
  res.json({ ok: true, links: igResult.value });
});

app.post("/api/v2/instagram", async (req, res) => {
  const post_id = req.body?.post_id?.trim();
  if (!post_id) {
    return void res
      .status(400)
      .json({ ok: false, error: { code: 400, message: "Should be post_id" } });
  }

  const elapsed = timeStart();
  const igResult = await getInstagram(post_id);
  if (igResult.isErr) {
    console.error(`/instagram error: ${igResult.error.message}, elapsed: ${elapsed()} ms`);
    return void res.json({ ok: false, error: igResult.error });
  }

  console.log(`Fetched instagram in ${elapsed()} ms ${post_id}`);
  res.json({ ok: true, value: igResult.value });
});

app.post("/api/v1/instagram_story", async (req, res) => {
  const url = req.body?.url?.trim();
  const id = req.body?.id?.trim();
  if (!url && !id) {
    return void res
      .status(400)
      .json({ ok: false, error: { code: 400, message: "Should be url or id" } });
  }

  const elapsed = timeStart();
  const igResult = await getInstagramStory({ id, url });
  if (igResult.isErr) {
    console.error(`/instagram_story error: ${igResult.error.message}, elapsed: ${elapsed()} ms`);
    return void res.json({ ok: false, error: igResult.error });
  }

  console.log(
    `Fetched instagram_story. ${igResult.value.length} links found in ${elapsed()} ms ${id} ${url}`,
  );
  res.json({ ok: true, links: igResult.value });
});

app.post("/api/v1/threads", async (req, res) => {
  const url = req.body?.url?.trim();
  if (!url) {
    return void res.status(400).json({ ok: false, error: { code: 400, message: "Should be url" } });
  }

  const elapsed = timeStart();
  const reqResult = await getThreads(url);
  if (reqResult.isErr) {
    console.error(`/threads error: ${reqResult.error.message}, elapsed: ${elapsed()} ms`);
    return void res.json({ ok: false, error: reqResult.error });
  }

  console.log(`Fetched threads in ${elapsed()} ms ${url}`);
  res.json({ ok: true, value: reqResult.value });
});

app.post("/api/v1/twitter", async (req, res) => {
  const id = req.body?.id?.trim();
  if (!id) {
    return void res
      .status(400)
      .json({ ok: false, error: { code: 400, message: "Should be tweet id" } });
  }

  const elapsed = timeStart();
  const reqResult = await getTwitter(id);
  if (reqResult.isErr) {
    console.error(`/twitter error: ${reqResult.error.message}, elapsed: ${elapsed()} ms ${id}`);
    return void res.json({ ok: false, error: reqResult.error });
  }

  console.log(`Fetched twitter in ${elapsed()} ms ${id}`);
  res.json({ ok: true, value: reqResult.value });
});

async function initCheckSenya() {
  if (process.env.DISABLE_CHECK_SENYA === "on") {
    return {
      checkSenya: async () => Err("checkSenya disabled by environment variable"),
    };
  }

  return await import("./src/services/senya/senya-service.js");
}

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
