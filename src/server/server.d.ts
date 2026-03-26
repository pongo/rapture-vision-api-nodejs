import type { Express } from "express";

export type ServerConfig = {
  checkSenya: any;
};

export function createServer({ checkSenya }: ServerConfig): Express;
