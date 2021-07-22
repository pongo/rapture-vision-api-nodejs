"use strict";

const { checkFaceMatch } = require("./face-service");
const { Ok } = require("./utils/result");

// мало ложных 0.58, по-умолчанию 0.6
const DISTANCE_THRESHOLD = 0.58;
const MODEL = "senya/senya_multi.json";

async function checkSenya(url) {
  const matchesResult = await checkFaceMatch(url, MODEL, DISTANCE_THRESHOLD);
  if (matchesResult.isErr) return matchesResult;

  const matches = matchesResult.value;
  prettyLogMatches(matches);
  const found = matches.some((x) => x.label.startsWith("senya"));
  return Ok(found);
}

function prettyLogMatches(matches) {
  const pretty = matches.map((m) => {
    return { ...m, box: [m.box.x, m.box.y, m.box.width, m.box.height] };
  });

  if (pretty.length === 1) {
    console.log(pretty[0]);
  } else {
    console.log(pretty);
  }
}

module.exports.checkSenya = checkSenya;
