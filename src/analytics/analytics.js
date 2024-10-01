"use strict";

const { CsvWriter } = require("./csv-writer");

class Analytics {
  constructor() {
    this.setupCsvFiles();
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

  setupCsvFiles() {
    this.apisCsvWriter = new CsvWriter(
      "analytics-api-calls.csv",
      "service,api,result,elapsed,created_at",
    );
  }
}

const analytics = new Analytics();

module.exports = { analytics };
