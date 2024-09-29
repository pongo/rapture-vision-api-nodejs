"use strict";

/**
 * @param {string} str
 * @returns {boolean | undefined}
 */
function startsWithHttp(str) {
  return str?.startsWith("http");
}

module.exports = { startsWithHttp };
