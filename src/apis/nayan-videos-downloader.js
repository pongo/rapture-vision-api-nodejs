import axios from "axios";

const apiBaseUrl = "https://nayan-video-downloader.vercel.app/";

export default {
  ndown: createRequest("ndown"),
  instagram: createRequest("instagram"),
  tikdown: createRequest("tikdown"),
  ytdown: createRequest("ytdown"),
  threads: createRequest("threads"),
  twitterdown: createRequest("twitterdown"),
  fbdown2: createRequest("fbdown2", (url, key) => ({ url, key })),
  GDLink: createRequest("GDLink"),
  pintarest: createRequest("pintarest"),
  capcut: createRequest("capcut"),
  likee: createRequest("likee"),
  // facebook, tiktok, twitter, instagram, youtube, pinterest, gdrive, capcut, likee, threads
  alldown: createRequest("alldown"),
  spotifySearch: createRequest("spotify-search", (name, limit) => ({ name, limit })),
  soundcloudSearch: createRequest("soundcloud-search", (name, limit) => ({ name, limit })),
  spotifyDl: createRequest("spotifyDl", (url) => ({ url })),
  soundcloud: createRequest("soundcloud", (url) => ({ url })),
  terabox: createRequest("terabox", (url) => ({ url })),
};

function createRequest(endpoint, formatData) {
  return async (url, key) => {
    try {
      const params = formatData ? formatData(url, key) : { url };
      const response = await axios.get(`${apiBaseUrl}${endpoint}`, { params });
      return response.data;
    } catch {
      return {
        status: false,
        msg: `${capitalize(endpoint.replace(/^\w/, (c) => c.toUpperCase()))} API error`,
      };
    }
  };
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
