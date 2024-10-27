export function sanitizeFilename(input, options) {
  const replacement = (options && options.replacement) || "";
  const output = sanitize(input, replacement);
  if (replacement === "") {
    return output;
  }
  return sanitize(output, "");
}

function sanitize(input, replacement) {
  const illegalRe = /[/?<>\\:*|":]/g;
  // eslint-disable-next-line no-control-regex
  const controlRe = /[\x00-\x1f\x80-\x9f]/g;
  const reservedRe = /^\.+$/;
  const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;

  const sanitized = input
    .replace(illegalRe, replacement)
    .replace(controlRe, replacement)
    .replace(reservedRe, replacement)
    .replace(windowsReservedRe, replacement);
  return truncate(sanitized, 255);
}

function truncate(sanitized, length) {
  const uint8Array = new TextEncoder().encode(sanitized);
  const truncated = uint8Array.slice(0, length);
  return new TextDecoder().decode(truncated);
}
