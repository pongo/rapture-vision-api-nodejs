"use strict";

function formatErr(res) {
  return res.isErr ? `${res.error.name}: ${res.error.message}` : "";
}

module.exports = { formatErr };
