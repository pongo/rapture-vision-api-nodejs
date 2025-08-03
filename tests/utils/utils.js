/* c8 ignore start */
/* node:coverage disable */

export function formatErr(res) {
  return res.isErr ? `${res.error.name}: ${res.error.message}` : "";
}

export function createLogManager() {
  const origLog = console.log;
  const origError = console.error;

  return {
    silent,
    restore,
  };

  function silent() {
    console.log = () => {};
    console.error = () => {};
  }

  function restore() {
    console.log = origLog;
    console.error = origError;
  }
}
