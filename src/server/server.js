import express from "express";
import { timeStart } from "../utils/time-start.js";
import { getTiktok } from "../services/tiktok/tiktok-service.js";
import {
  getInstagram,
  getInstagram_v1,
  getInstagramStory,
} from "../services/instagram/instagram-service.js";
import { getThreads } from "../services/threads-service.js";
import { getTwitter } from "../services/twitter/twitter-service.js";
import { Err } from "../utils/result.js";
import {
  Instagram1Scheme,
  Instagram2Scheme,
  InstagramStoryScheme,
  SenyaScheme,
  ThreadsScheme,
  TiktokScheme,
  TwitterScheme,
  validate,
} from "./validation.js";

const { checkSenya } = await initCheckSenya();

const app = express();

app.use(express.json());

app.post("/api/senya", validate(SenyaScheme), async (req, res) => {
  const { url } = req.validatedBody;
  const elapsed = timeStart();
  const senyaResult = await checkSenya(url);
  if (senyaResult.isErr) {
    console.error(`checkSenya error: ${senyaResult.error.message}, elapsed: ${elapsed()} ms`);
    return void res.json({ ok: false, error: senyaResult.error });
  }

  console.log(`${senyaResult.value ? "Yes" : "Not"} senya in ${elapsed()} ms ${url}`);
  res.json({ ok: true, is_senya: senyaResult.value });
});

app.post("/api/v1/tiktok-video", validate(TiktokScheme), async (req, res) => {
  const videoUrl = req.validatedBody.video;
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

app.post("/api/v1/instagram", validate(Instagram1Scheme), async (req, res) => {
  const { url, post_id } = req.validatedBody;
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

app.post("/api/v2/instagram", validate(Instagram2Scheme), async (req, res) => {
  const { post_id } = req.validatedBody;
  const elapsed = timeStart();
  const igResult = await getInstagram(post_id);
  if (igResult.isErr) {
    console.error(`/instagram error: ${igResult.error.message}, elapsed: ${elapsed()} ms`);
    return void res.json({ ok: false, error: igResult.error });
  }

  console.log(`Fetched instagram in ${elapsed()} ms ${post_id}`);
  res.json({ ok: true, value: igResult.value });
});

app.post("/api/v1/instagram_story", validate(InstagramStoryScheme), async (req, res) => {
  const { url, id } = req.validatedBody;
  const elapsed = timeStart();
  const igResult = await getInstagramStory({ id });
  if (igResult.isErr) {
    console.error(`/instagram_story error: ${igResult.error.message}, elapsed: ${elapsed()} ms`);
    return void res.json({ ok: false, error: igResult.error });
  }

  console.log(
    `Fetched instagram_story. ${igResult.value.length} links found in ${elapsed()} ms ${id} ${url}`,
  );
  res.json({ ok: true, links: igResult.value });
});

app.post("/api/v1/threads", validate(ThreadsScheme), async (req, res) => {
  const { url } = req.validatedBody;
  const elapsed = timeStart();
  const reqResult = await getThreads(url);
  if (reqResult.isErr) {
    console.error(`/threads error: ${reqResult.error.message}, elapsed: ${elapsed()} ms`);
    return void res.json({ ok: false, error: reqResult.error });
  }

  console.log(`Fetched threads in ${elapsed()} ms ${url}`);
  res.json({ ok: true, value: reqResult.value });
});

app.post("/api/v1/twitter", validate(TwitterScheme), async (req, res) => {
  const { id } = req.validatedBody;
  const elapsed = timeStart();
  const reqResult = await getTwitter(id);
  if (reqResult.isErr) {
    console.error(`/twitter error: ${reqResult.error.message}, elapsed: ${elapsed()} ms ${id}`);
    return void res.json({ ok: false, error: reqResult.error });
  }

  console.log(`Fetched twitter in ${elapsed()} ms ${id}`);
  res.json({ ok: true, value: reqResult.value });
});

app.use((error, req, res, _next) => {
  console.error(`Uncaught error on ${req.method} ${req.path}`);
  console.error(error);
  const status = error.statusCode || 500;
  const message = error.message || "Internal Server Error";
  res.status(status).json({ status, error: message });
});

async function initCheckSenya() {
  if (process.env.DISABLE_CHECK_SENYA === "on") {
    return {
      checkSenya: async () => Err("checkSenya disabled by environment variable"),
    };
  }

  return await import("../services/senya/senya-service.js");
}

export function startServer(port, cb) {
  app.listen(port, cb);
}
