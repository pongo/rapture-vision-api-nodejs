"use strict";

const { Balancer } = require("../../utils/balancer");
const { Err } = require("../../utils/result");
const { apis } = require("./twitter-apis");

const balancer = new Balancer({ name: "twitter", apis, shuffle: true, strategy: "last" });

async function getTwitter(id) {
  try {
    return await balancer.callOneRound({ id });
  } catch (error) {
    return Err(`getTwitter error: ${error.message}`, { error });
  }
}

module.exports = { getTwitter };
