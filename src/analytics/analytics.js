"use strict";

const { CsvWriter } = require("./csv-writer");

class Analytics {
  constructor() {
    this.apisCsvWriter = new CsvWriter(
      "analytics-api-calls.csv",
      "service,api,result,elapsed,created_at",
    );
  }

  async trackApiCall(service, api, isOk, elapsedMs) {
    this.apisCsvWriter.writeRow([
      service,
      api,
      isOk ? "ok" : "err",
      elapsedMs,
      new Date().toISOString(),
    ]);
  }
}

const analytics = new Analytics();

module.exports = { analytics };
