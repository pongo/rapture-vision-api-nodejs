"use strict";

const writeJsonFile = require("write-json-file");
const { Ok, Err } = require("../../utils/result");
const fs = require("node:fs/promises");

/**
 * @param result
 * @returns {boolean}
 * @private
 */
function _checkResult(result) {
  const { text, images, videos } = result;
  return text !== "" || images.length > 0 || videos.length > 0;
}

async function checkResult(result, apiName, twitterId, data, remaining, reset) {
  const success = _checkResult(result);

  if (process.env.TWITTER_SAVE_RESPONSE === "on") {
    if (success) {
      await writeJsonFile(`./tmp/twitter/${apiName}/${twitterId}.json`, data);
    } else {
      await writeJsonFile(`./tmp/twitter/${apiName}/${twitterId}-empty.json`, data);
    }
  }

  if (success) {
    return Ok({ ...result, remaining, reset });
  } else {
    return Err(`[${apiName}] empty result`, { remaining, reset });
  }
}

async function requestFile(apiName, id) {
  try {
    return Ok({
      data: JSON.parse(await fs.readFile(`./tmp/twitter/${apiName}/${id}.json`, "utf-8")),
    });
  } catch {
    return Err("Not found");
  }
}

module.exports = { checkResult, requestFile };
