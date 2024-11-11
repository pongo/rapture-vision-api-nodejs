import type { Express } from "express";
import type { createGetInstagram } from "../services/instagram/instagram-service.d.ts";
import type { createGetTiktok } from "../services/tiktok/tiktok-service.d.ts";
import type { createGetTwitter } from "../services/twitter/twitter-service.d.ts";

export type ServerConfig = {
  checkSenya: any;
  getInstagram: ReturnType<typeof createGetInstagram>;
  getInstagramStory: any;
  getTiktok: ReturnType<typeof createGetTiktok>;
  getTwitter: ReturnType<typeof createGetTwitter>;
  getThreads: any;
};

export function createServer({
  checkSenya,
  getInstagram,
  getInstagramStory,
  getTiktok,
  getTwitter,
  getThreads,
}: ServerConfig): Express;
