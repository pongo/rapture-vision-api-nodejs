import "dotenv/config";
//
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { requestRapidApiFetch } from "../src/utils/rapidapi.js";
import { formatErr } from "../src/utils/testing-utils.js";

describe("requestRapidApi", () => {
  it.skip("GET with params", async () => {
    const res = await requestRapidApiFetch("GET", "https://imdb8.p.rapidapi.com/v2/search", {
      host: "imdb8.p.rapidapi.com",
      params: {
        searchTerm: "tom cruise",
        type: "NAME",
        first: "20",
        country: "US",
        language: "en-US",
      },
    });
    // console.log(res);
    assert.ok(res.isOk, formatErr(res));
    assert.ok(Number.isInteger(res.value.remaining));
    assert.ok(Number.isInteger(res.value.reset));
    assert.ok(res.value.data.data.mainSearch);
  });

  it.skip("POST", async () => {
    const res = await requestRapidApiFetch(
      "POST",
      "https://onecompiler-apis.p.rapidapi.com/api/v1/run",
      {
        host: "onecompiler-apis.p.rapidapi.com'",
        body: {
          language: "python",
          stdin: "Peter",
          files: [
            {
              name: "index.py",
              content: "import sys\nname = sys.stdin.readline()\nprint('Hello '+ name)",
            },
          ],
        },
      },
    );
    // console.log(res);
    assert.ok(res.isOk, formatErr(res));
    assert.ok(Number.isInteger(res.value.remaining));
    assert.ok(Number.isInteger(res.value.reset));
    assert.deepEqual(res.value.data.status, "success");
  });
});
