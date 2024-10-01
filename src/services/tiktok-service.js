"use strict";

const { Err } = require("../utils/result");
const { Balancer } = require("../utils/balancer");
const { apis } = require("./tiktok/apis");
const { analytics } = require("../analytics/analytics");

const balancer = new Balancer({ name: "tiktok", apis, shuffle: true, strategy: "last", analytics });

async function getTiktok(url) {
  try {
    return await balancer.callOneRound(url, { loadFromDisk: false });
  } catch (error) {
    return Err(`getTiktok error: ${error.message}`, { error, url });
  }
}

module.exports = { getTiktok };
