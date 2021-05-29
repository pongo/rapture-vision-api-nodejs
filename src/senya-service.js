"use strict";

const { checkFaceMatch } = require("./face-service");
const { Ok } = require("./utils/result");

// мало ложных 0.58, по-умолчанию 0.6
const DISTANCE_THRESHOLD = 0.65;
const MODEL = "senya/senya_multi.json";

async function checkSenya(url) {
  const matchesResult = await checkFaceMatch(url, MODEL, DISTANCE_THRESHOLD);
  if (matchesResult.isErr) return matchesResult;

  const matches = matchesResult.value;
  console.log(matches);
  const found = matches.some((x) => x.label.startsWith("senya"));
  return Ok(found);
}

module.exports.checkSenya = checkSenya;
