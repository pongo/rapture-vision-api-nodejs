import { apiList } from "../../../utils/api-utils.js";
import * as npmLibs from "./npm-libs.js";
import * as rapidApis from "./rapidapis.js";

/** @type {import("./shared.d.ts").InstagramApis} */
export const apis = [
  // ["fail", async ({ id }) => Err("Fail", { remaining: 100, reset: 1 })],

  ...apiList(npmLibs),
  ...apiList(rapidApis),
];
