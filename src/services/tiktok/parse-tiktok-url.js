"use strict";

const reShortVM = /(?:v.)\.tiktok\.com\/(\w+?)(?:\/|\?|$)/i;
const reShortT = /tiktok\.com\/(?:t\/)(\w+?)(?:\/|\?|$)/i;
const reWithUsername = /tiktok\.com\/@([\w.-]+)(?:\/video\/|\/.*item_id=)([\d]+)/i;
const reId = /(?:\/|\?shareId=|\&item_id=)(\d+)/i;

/**
 * @param {string} url
 * @returns {({ shortcode: string; id?: never; username?: never } | { username?: string; id: string; shortcode?: never })}
 */
function parseTiktokUrl(url) {
  return (
    parseShort(url, reShortVM) ||
    parseShort(url, reShortT) ||
    parseWithUsername(url) ||
    parseId(url)
  );
}

function parseShort(url, re) {
  const match = url.match(re);
  return match ? { shortcode: match[1] } : undefined;
}

function parseWithUsername(url) {
  const match = url.match(reWithUsername);
  return match ? { username: match[1], id: match[2] } : undefined;
}

function parseId(url) {
  const match = url.match(reId);
  return match ? { id: match[1] } : undefined;
}

module.exports = { parseTiktokUrl };
