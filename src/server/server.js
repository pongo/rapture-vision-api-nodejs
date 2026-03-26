import express from "express";
import { timeStart } from "../utils/time-start.js";
import { SenyaScheme, validate } from "./validation.js";

/** @type {import("./server.d.ts").createServer} */
export function createServer({ checkSenya }) {
  const app = express();

  app.use(express.json());

  app.post("/api/senya", validate(SenyaScheme), async (req, res) => {
    const { url } = req.safeData.body;
    const elapsed = timeStart();
    const result = await checkSenya(url);
    if (result.isErr) {
      console.error(`checkSenya error: ${result.error.message}, elapsed: ${elapsed()} ms`);
      return void res.json({ ok: false, error: result.error });
    }

    console.log(`${result.value ? "Yes" : "Not"} senya in ${elapsed()} ms ${url}`);
    res.json({ ok: true, is_senya: result.value });
  });

  app.use((error, req, res, _next) => {
    console.error(`Uncaught error on ${req.method} ${req.path}`);
    console.error(error);
    const status = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    res.status(status).json({ status, error: message });
  });

  return app;
}
