export function formatErr(res) {
  return res.isErr ? `${res.error.name}: ${res.error.message}` : "";
}
