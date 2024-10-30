import "dotenv/config";
//
import * as v from "@badrap/valita";
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

const TrimmedString = v.string().map((x) => x.trim());
const NonEmptyString = TrimmedString.assert((s) => s.length > 0, "empty");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const SenyaScheme = v.object({
  url: NonEmptyString,
});

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

const TiktokScheme = v.object({
  video: NonEmptyString,
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

const Instagram1Scheme = v
  .object({
    url: TrimmedString.optional(),
    post_id: TrimmedString.optional(),
  })
  .assert((x) => x.url || x.post_id, "should be post_id or url");

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

const Instagram2Scheme = v.object({
  post_id: NonEmptyString,
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

const InstagramStoryScheme = v
  .object({
    url: TrimmedString.optional(),
    id: TrimmedString.optional(),
  })
  .assert((x) => x.url || x.id, "should be url or id");

app.post("/api/v1/instagram_story", validate(InstagramStoryScheme), async (req, res) => {
  const { url, id } = req.validatedBody;
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

const ThreadsScheme = v.object({
  url: NonEmptyString,
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

const TwitterScheme = v.object({
  id: NonEmptyString,
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

  return await import("./src/services/senya/senya-service.js");
}

function sendValidationError(res, validationResult) {
  res.status(400).json({ ok: false, error: { code: 400, message: validationResult.message } });
}

function validate(schema) {
  return (req, res, next) => {
    try {
      const validationResult = schema.try(req.body);
      if (!validationResult.ok) {
        sendValidationError(res, validationResult);
        return;
      }

      req.validatedBody = validationResult.value;
    } catch (error) {
      console.error(error);
      next(error);
      return;
    }

    next();
  };
}

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
