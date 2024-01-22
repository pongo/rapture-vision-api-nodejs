import fs from "node:fs/promises";
import { suite } from "uvu";

export async function loadJson(path) {
  return JSON.parse(await fs.readFile(path, "utf-8"));
}

export function describe(title, fn) {
  const it = suite(title);
  fn(it);
  it.run();
}
