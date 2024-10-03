"use strict";

function startsWithHttp(str) {
  return str == null ? false : str.startsWith("http");
}

module.exports = { startsWithHttp };
