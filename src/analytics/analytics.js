import { CsvWriter } from "./csv-writer.js";

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

export const analytics = new Analytics();
