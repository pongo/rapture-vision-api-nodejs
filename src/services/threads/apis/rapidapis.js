import { startsWithHttp } from "../../../utils/api-utils.js";
import { requestRapidApiFetch } from "../../../utils/rapidapi.js";
import { Err, Ok } from "../../../utils/result.js";
import { SimpleMemCache } from "../../../utils/simple-mem-cache.js";
import { getThreadsShortcode, ThreadsFactory } from "./shared.js";

const threadsIdCache = new SimpleMemCache();
const HOUR = 60 * 60 * 1000;
const EXPIRE = 24 * HOUR;

// https://rapidapi.com/coder2077/api/instagram-tiktok-youtube-downloader/
// https://rapidapi.com/coder2077/api/all-in-one-downloader-api
// https://rapidapi.com/coder2077/api/youtube-video-and-audio-downloader-api1/
export const fetchCoder2077 = ThreadsFactory("threads/coder2077", {
  async fetchFn(url) {
    return await requestRapidApiFetch(
      "GET",
      "https://youtube-video-and-audio-downloader-api1.p.rapidapi.com/get-info",
      {
        host: "youtube-video-and-audio-downloader-api1.p.rapidapi.com",
        params: { url },
      },
    );
  },
  parseFn({ remaining, reset, data }) {
    if (data?.medias && data.medias.length > 0) {
      const medias = data.medias;
      return {
        images: filterMedias(medias, "image", "url"),
        videos: filterMedias(medias, "video", "url"),
        remaining,
        reset,
      };
    }

    return { remaining, reset, images: [], videos: [] };
  },
});

// https://rapidapi.com/uzapishop/api/facebook-download-media/
// https://rapidapi.com/uzapishop/api/threads-scraper-api1/
// https://rapidapi.com/uzapishop/api/full-downloader-social-media/
// https://rapidapi.com/uzapishop/api/instagram-downloader-download-instagram-videos-stories1/
export const fetchUzapishop = ThreadsFactory("threads/uzapishop", {
  async fetchFn(url) {
    return await requestRapidApiFetch(
      "GET",
      "https://instagram-downloader-download-instagram-videos-stories1.p.rapidapi.com/get-info-rapidapi",
      {
        host: "instagram-downloader-download-instagram-videos-stories1.p.rapidapi.com",
        params: { url },
      },
    );
  },
  parseFn({ remaining, reset, data }) {
    if (data?.medias && data.medias.length > 0) {
      const medias = data.medias;
      return {
        images: filterMedias(medias, "image", "url"),
        videos: filterMedias(medias, "video", "url"),
        remaining,
        reset,
      };
    }

    return { remaining, reset, images: [], videos: [] };
  },
});

// https://rapidapi.com/fastnewsuz-7TPP_Z68cQ2/api/threads-download-media/
export const fetchFastnewsuz = ThreadsFactory("threads/fastnewsuz", {
  async fetchFn(url) {
    return await requestRapidApiFetch("GET", "https://threads-download-media.p.rapidapi.com/", {
      host: "threads-download-media.p.rapidapi.com",
      params: { url },
    });
  },
  parseFn({ remaining, reset, data }) {
    if (data?.medias && data.medias.length > 0) {
      const medias = data.medias;
      return {
        images: filterMedias(medias, "image", "url"),
        videos: filterMedias(medias, "video", "url"),
        remaining,
        reset,
      };
    }

    return { remaining, reset, images: [], videos: [] };
  },
});

// // https://rapidapi.com/andryrleric/api/fast-video-dowloander/
// // https://rapidapi.com/andryerics/api/all-media-downloader1
// export const fetchAndryrleric = ThreadsFactory("threads/andryrleric", {
//   async fetchFn(url) {
//     return await requestRapidApiFetch("POST", "https://fast-video-dowloander.p.rapidapi.com/all", {
//       host: "fast-video-dowloander.p.rapidapi.com",
//       params: { url: url.replace("https://www.threads.com/", "https://www.threads.net/") },
//     });
//   },
//   parseFn({ remaining, reset, data }) {
//     if (data?.medias && data.medias.length > 0) {
//       const medias = data.medias;
//       return {
//         images: filterMedias(medias, "image", "url"),
//         videos: filterMedias(medias, "video", "url"),
//         remaining,
//         reset,
//       };
//     }
//
//     return { remaining, reset, images: [], videos: [] };
//   },
// });

// https://rapidapi.com/manhgdev/api/threads-api7
// https://rapidapi.com/nguyenmanhict-MuTUtGWD7K/api/threads-media-download
export const fetchManhgcoder = ThreadsFactory("threads/manhgcoder", {
  async fetchFn(url) {
    const shortcode = getThreadsShortcode(url);
    if (!shortcode) throw new Error(`Invalid Threads URL: ${url}`);

    return await requestRapidApiFetch(
      "POST",
      "https://threads-media-download.p.rapidapi.com/post/idcode",
      {
        host: "threads-media-download.p.rapidapi.com",
        body: { shortcode },
      },
    );
  },
  parseFn({ remaining, reset, data }) {
    if (data?.data?.data) {
      const { images, videos } = extractPost(data.data.data);
      return { images, videos, remaining, reset };
    }

    return { remaining, reset, images: [], videos: [] };
  },
});

// https://rapidapi.com/liucccccccccccc/api/threads-cheapest-api/
export const fetchLiucccccccccccc = ThreadsFactory("threads/liucccccccccccc", {
  async fetchFn(url) {
    const shortcode = getThreadsShortcode(url);
    if (!shortcode) throw new Error(`Invalid Threads URL: ${url}`);

    return await requestRapidApiFetch(
      "GET",
      "https://threads-cheapest-api.p.rapidapi.com/api/v1/threads/post/detail/by_code",
      {
        host: "threads-cheapest-api.p.rapidapi.com",
        params: { post_code: shortcode },
      },
    );
  },
  parseFn({ remaining, reset, data }) {
    if (data?.data?.data?.edges?.[0]?.node?.thread_items?.[0]?.post) {
      const { images, videos } = extractPost(data.data.data.edges[0].node.thread_items[0].post);
      return { images, videos, remaining, reset };
    }

    return { remaining, reset, images: [], videos: [] };
  },
});

// https://rapidapi.com/cavsn/api/threads-by-meta-threads-an-instagram-app-detailed/
export const fetchCavsn = ThreadsFactory("threads/cavsn", {
  async fetchFn(url) {
    const shortcode = getThreadsShortcode(url);
    if (!shortcode) throw new Error(`Invalid Threads URL: ${url}`);

    return await requestRapidApiFetch(
      "GET",
      "https://threads-by-meta-threads-an-instagram-app-detailed.p.rapidapi.com/get_post_with_web_id",
      {
        host: "threads-by-meta-threads-an-instagram-app-detailed.p.rapidapi.com",
        params: { web_id: shortcode },
      },
    );
  },
  parseFn({ remaining, reset, data }) {
    if (data?.post) {
      const { images, videos } = extractPost(data.post);
      return { images, videos, remaining, reset };
    }

    return { remaining, reset, images: [], videos: [] };
  },
});

// async function fetchGlavierThreadsId(shortcode) {
//   const res = await requestRapidApiFetch(
//     "GET",
//     "https://meta-threads.p.rapidapi.com/v1/thread/id/",
//     {
//       host: "meta-threads.p.rapidapi.com",
//       params: { shortcode },
//     },
//   );
//   console.log(res);
//   return res?.data?.thread_id;
// }
//
// // https://rapidapi.com/Glavier/api/meta-threads
// export const fetchGlavier = ThreadsFactory("threads/Glavier", {
//   async fetchFn(url) {
//     const shortcode = getThreadsShortcode(url);
//     if (!shortcode) throw new Error(`Invalid Threads URL: ${url}`);
//
//     const thread_id = await fetchGlavierThreadsId(shortcode);
//     if (!thread_id) throw new Error(`Thread ID not found for ${url}`);
//
//     return await requestRapidApiFetch(
//       "GET",
//       "https://meta-threads.p.rapidapi.com/v1/thread/details/",
//       {
//         host: "meta-threads.p.rapidapi.com",
//         params: { thread_id },
//       },
//     );
//   },
//   parseFn({ remaining, reset, data }) {
//     if (data?.data?.data?.edges?.[0]?.node?.thread_items?.[0]?.post) {
//       const { images, videos } = extractPost(data.data.data.edges[0].node.thread_items[0].post);
//       return { images, videos, remaining, reset };
//     }
//
//     return { remaining, reset, images: [], videos: [] };
//   },
// });

async function fetchLundehundThreadsId(url) {
  const cached = threadsIdCache.get(url);
  if (cached) {
    console.log("ThreadsId cache found");
    return Ok(cached);
  }

  const res = await requestRapidApiFetch(
    "GET",
    "https://threads-api4.p.rapidapi.com/api/post/get-id",
    {
      host: "threads-api4.p.rapidapi.com",
      params: { url: url.replace("https://www.threads.com/", "https://www.threads.net/") },
    },
  );
  if (res.isErr) {
    return res;
  }
  // console.dir(res, { depth: null });
  const post_id = res.value?.data?.data?.post_id;
  if (post_id !== undefined) {
    threadsIdCache.add(url, post_id, EXPIRE);
    return Ok(post_id);
  }

  return Err(`Post ID not found for ${url}`);
}

// https://rapidapi.com/Lundehund/api/threads-api4/
export const fetchLundehund = ThreadsFactory("threads/Lundehund", {
  async fetchFn(url) {
    const shortcode = getThreadsShortcode(url);
    if (!shortcode) throw new Error(`Invalid Threads URL: ${url}`);

    const postIdResult = await fetchLundehundThreadsId(url);
    if (postIdResult.isErr) throw new Error(`Thread ID not found for ${url}`);

    return await requestRapidApiFetch(
      "GET",
      "https://threads-api4.p.rapidapi.com/api/post/detail",
      {
        host: "threads-api4.p.rapidapi.com",
        params: { post_id: postIdResult.value },
      },
    );
  },
  parseFn({ remaining, reset, data }) {
    if (data?.data?.data?.edges?.[0]?.node?.thread_items?.[0]?.post) {
      const { images, videos } = extractPost(data.data.data.edges[0].node.thread_items[0].post);
      return { images, videos, remaining, reset };
    }

    return { remaining, reset, images: [], videos: [] };
  },
});

function filterMedias(medias, mediaType, key) {
  return medias
    .filter((x) => x.type === mediaType)
    .map((x) => x[key])
    .filter(startsWithHttp);
}

function extractPost(post) {
  const caption = post?.caption?.text ?? "";
  const likes = post?.like_count ?? 0;
  const replies = post?.text_post_app_info?.direct_reply_count ?? 0;

  const videos = [];
  const images = [];

  if (post?.carousel_media != null && post.carousel_media.length > 0) {
    post.carousel_media.forEach(extractMedia);
  } else {
    extractMedia(post);
  }

  return { caption, likes, replies, videos, images };

  function extractMedia(obj) {
    if (obj.video_versions && obj.video_versions.length > 0) {
      videos.push(obj.video_versions[0].url);
      return;
    }

    if (obj.image_versions2 && obj.image_versions2?.candidates.length > 0) {
      images.push(obj.image_versions2.candidates[0].url);
    }
  }
}
