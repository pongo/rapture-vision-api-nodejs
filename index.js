"use strict";

const express = require("express");
const { timeStart } = require("./src/utils/time-start");
const { checkSenya } = require("./src/senya-service");

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

app.listen(port, () => {
  console.log("Server started on port " + port);
});
