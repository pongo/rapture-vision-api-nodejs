import { apiList } from "../../../utils/api-utils.js";
import * as npmLibs from "./npm-libs.js";
import * as rapidApis from "./rapidapis.js";

export const apis = [
  // ["fail", async (id) => Err("Fail", { remaining: 100, reset: 1 })],
  // ["ok", async (id) => Ok({ videos: ["https://video.mp4"] })],

  ...apiList(npmLibs),
  ...apiList(rapidApis),
];
