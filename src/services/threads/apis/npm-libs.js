import { threads as universalDownloader } from "../../../apis/universal-downloader.js";
import { ThreadsFactory } from "./shared.js";

const emptyResult = { images: [], videos: [] };

export const fetchUniversalDownloader = ThreadsFactory("threads/universalDownloader", {
  async fetchFn(url) {
    return await universalDownloader(url);
  },
  parseFn(data) {
    if (data) {
      return data;
    }
    return { ...emptyResult };
  },
});
