import express from "express";
import { getInstagram, getInstagramStory } from "../services/instagram/instagram-service.js";
import { getThreads } from "../services/threads-service.js";
import { getTiktok } from "../services/tiktok/tiktok-service.js";
import { getTwitter } from "../services/twitter/twitter-service.js";
import { Err } from "../utils/result.js";
import { timeStart } from "../utils/time-start.js";
import {
  InstagramScheme,
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
  const result = await checkSenya(url);
  if (result.isErr) {
    console.error(`checkSenya error: ${result.error.message}, elapsed: ${elapsed()} ms`);
    return void res.json({ ok: false, error: result.error });
  }

  console.log(`${result.value ? "Yes" : "Not"} senya in ${elapsed()} ms ${url}`);
  res.json({ ok: true, is_senya: result.value });
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

app.post("/api/v2/instagram", validate(InstagramScheme), async (req, res) => {
  const { post_id } = req.validatedBody;
  const elapsed = timeStart();
  const result = await getInstagram(post_id);
  if (result.isErr) {
    console.error(`/instagram error: ${result.error.message}, elapsed: ${elapsed()} ms`);
    return void res.json({ ok: false, error: result.error });
  }

  console.log(`Fetched instagram in ${elapsed()} ms ${post_id}`);
  res.json({ ok: true, value: result.value });
});

app.post("/api/v1/instagram_story", validate(InstagramStoryScheme), async (req, res) => {
  const { url, id } = req.validatedBody;
  const elapsed = timeStart();
  const result = await getInstagramStory({ id });
  if (result.isErr) {
    console.error(`/instagram_story error: ${result.error.message}, elapsed: ${elapsed()} ms`);
    return void res.json({ ok: false, error: result.error });
  }

  console.log(
    `Fetched instagram_story. ${result.value.length} links found in ${elapsed()} ms ${id} ${url}`,
  );
  res.json({ ok: true, links: result.value });
});

app.post("/api/v1/threads", validate(ThreadsScheme), async (req, res) => {
  const { url } = req.validatedBody;
  const elapsed = timeStart();
  const result = await getThreads(url);
  if (result.isErr) {
    console.error(`/threads error: ${result.error.message}, elapsed: ${elapsed()} ms`);
    return void res.json({ ok: false, error: result.error });
  }

  console.log(`Fetched threads in ${elapsed()} ms ${url}`);
  res.json({ ok: true, value: result.value });
});

app.post("/api/v1/twitter", validate(TwitterScheme), async (req, res) => {
  const { id } = req.validatedBody;
  const elapsed = timeStart();
  const result = await getTwitter(id);
  if (result.isErr) {
    console.error(`/twitter error: ${result.error.message}, elapsed: ${elapsed()} ms ${id}`);
    return void res.json({ ok: false, error: result.error });
  }

  console.log(`Fetched twitter in ${elapsed()} ms ${id}`);
  res.json({ ok: true, value: result.value });
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
