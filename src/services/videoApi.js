const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

const BASE_URL = "https://www.googleapis.com/youtube/v3";

/* --------------------------------------------------
   FORMAT DURATION
-------------------------------------------------- */

export function formatDuration(duration) {
  if (!duration) return "0:00";

  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  if (!match) return "0:00";

  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/* --------------------------------------------------
   GET VIDEOS
-------------------------------------------------- */

export async function getVideos() {
  try {
    const url =
      `${BASE_URL}/videos?part=snippet,contentDetails,statistics` +
      `&chart=mostPopular` +
      `&regionCode=IN` +
      `&maxResults=20` +
      `&key=${API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    return (data.items || []).map((video) => ({
      id: video.id,

      title: video.snippet?.title || "Untitled Video",

      channel: video.snippet?.channelTitle || "Unknown Channel",

      channelId: video.snippet?.channelId || "",

      channelImage: "",

      thumbnail:
        video.snippet?.thumbnails?.high?.url ||
        video.snippet?.thumbnails?.medium?.url ||
        video.snippet?.thumbnails?.default?.url ||
        "",

      duration: formatDuration(video.contentDetails?.duration),

      views: video.statistics?.viewCount || "0",

      publishedAt: video.snippet?.publishedAt || "",
    }));
  } catch (error) {
    console.error("Error fetching videos:", error);
    return [];
  }
}

/* --------------------------------------------------
   GET VIDEO BY ID
-------------------------------------------------- */

export async function getVideoById(videoId) {
  try {
    const url =
      `${BASE_URL}/videos?part=snippet,contentDetails,statistics` +
      `&id=${videoId}` +
      `&key=${API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return null;
    }

    const video = data.items[0];

    return {
      id: video.id,

      title: video.snippet?.title || "Untitled Video",

      channel: video.snippet?.channelTitle || "Unknown Channel",

      channelId: video.snippet?.channelId || "",

      channelImage: "",

      thumbnail:
        video.snippet?.thumbnails?.high?.url ||
        video.snippet?.thumbnails?.medium?.url ||
        video.snippet?.thumbnails?.default?.url ||
        "",

      duration: formatDuration(video.contentDetails?.duration),

      views: video.statistics?.viewCount || "0",

      publishedAt: video.snippet?.publishedAt || "",

      description: video.snippet?.description || "",
    };
  } catch (error) {
    console.error("Error fetching video:", error);
    return null;
  }
}

/* --------------------------------------------------
   SEARCH VIDEOS
-------------------------------------------------- */

export async function searchVideos(query) {
  try {
    if (!query || !query.trim()) {
      return [];
    }

    const url =
      `${BASE_URL}/search?part=snippet` +
      `&q=${encodeURIComponent(query)}` +
      `&type=video` +
      `&maxResults=20` +
      `&key=${API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    return (data.items || []).map((item) => ({
      id: item.id.videoId,

      title: item.snippet?.title || "Untitled Video",

      channel: item.snippet?.channelTitle || "Unknown Channel",

      channelId: item.snippet?.channelId || "",

      channelImage: "",

      thumbnail:
        item.snippet?.thumbnails?.high?.url ||
        item.snippet?.thumbnails?.medium?.url ||
        item.snippet?.thumbnails?.default?.url ||
        "",

      duration: "",

      views: "0",

      publishedAt: item.snippet?.publishedAt || "",
    }));
  } catch (error) {
    console.error("Error searching videos:", error);
    return [];
  }
}

/* --------------------------------------------------
   GET CATEGORY VIDEOS
-------------------------------------------------- */

export async function getCategoryVideos(category) {
  try {
    const url =
      `${BASE_URL}/search?part=snippet` +
      `&q=${encodeURIComponent(category)}` +
      `&type=video` +
      `&maxResults=20` +
      `&order=relevance` +
      `&key=${API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    return (data.items || []).map((item) => ({
      id: item.id.videoId,

      title: item.snippet?.title || "Untitled Video",

      channel: item.snippet?.channelTitle || "Unknown Channel",

      channelId: item.snippet?.channelId || "",

      channelImage: "",

      thumbnail:
        item.snippet?.thumbnails?.high?.url ||
        item.snippet?.thumbnails?.medium?.url ||
        item.snippet?.thumbnails?.default?.url ||
        "",

      duration: "",

      views: "0",

      publishedAt: item.snippet?.publishedAt || "",
    }));
  } catch (error) {
    console.error("Error fetching category videos:", error);
    return [];
  }
}

/* --------------------------------------------------
   GET TRENDING VIDEOS
-------------------------------------------------- */

export async function getTrendingVideos() {
  try {
    const url =
      `${BASE_URL}/videos?part=snippet,contentDetails,statistics` +
      `&chart=mostPopular` +
      `&regionCode=IN` +
      `&maxResults=20` +
      `&key=${API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    return (data.items || []).map((video) => ({
      id: video.id,

      title: video.snippet?.title || "Untitled Video",

      channel: video.snippet?.channelTitle || "Unknown Channel",

      channelId: video.snippet?.channelId || "",

      channelImage: "",

      thumbnail:
        video.snippet?.thumbnails?.high?.url ||
        video.snippet?.thumbnails?.medium?.url ||
        video.snippet?.thumbnails?.default?.url ||
        "",

      duration: formatDuration(video.contentDetails?.duration),

      views: video.statistics?.viewCount || "0",

      publishedAt: video.snippet?.publishedAt || "",
    }));
  } catch (error) {
    console.error("Error fetching trending videos:", error);
    return [];
  }
}

/* --------------------------------------------------
   GET CHANNEL VIDEOS
-------------------------------------------------- */

export async function getChannelVideos(channelId) {
  try {
    /* Get channel information first */

    const channelUrl =
      `${BASE_URL}/channels?part=snippet,statistics` +
      `&id=${channelId}` +
      `&key=${API_KEY}`;

    const channelResponse = await fetch(channelUrl);

    if (!channelResponse.ok) {
      throw new Error(`HTTP error: ${channelResponse.status}`);
    }

    const channelData = await channelResponse.json();

    const channel = channelData.items?.[0];

    const channelImage =
      channel?.snippet?.thumbnails?.high?.url ||
      channel?.snippet?.thumbnails?.medium?.url ||
      channel?.snippet?.thumbnails?.default?.url ||
      "";

    const subscribers = channel?.statistics?.subscriberCount || "0";

    /* Get channel videos */

    const searchUrl =
      `${BASE_URL}/search?part=snippet` +
      `&channelId=${channelId}` +
      `&type=video` +
      `&order=date` +
      `&maxResults=20` +
      `&key=${API_KEY}`;

    const response = await fetch(searchUrl);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    const videoIds = (data.items || [])
      .map((item) => item.id?.videoId)
      .filter(Boolean);

    if (videoIds.length === 0) {
      return [];
    }

    /* Get duration + statistics */

    const detailsUrl =
      `${BASE_URL}/videos?part=contentDetails,statistics` +
      `&id=${videoIds.join(",")}` +
      `&key=${API_KEY}`;

    const detailsResponse = await fetch(detailsUrl);

    if (!detailsResponse.ok) {
      throw new Error(`HTTP error: ${detailsResponse.status}`);
    }

    const detailsData = await detailsResponse.json();

    const detailsMap = {};

    (detailsData.items || []).forEach((video) => {
      detailsMap[video.id] = video;
    });

    return (data.items || []).map((item) => {
      const videoId = item.id.videoId;

      const details = detailsMap[videoId];

      return {
        id: videoId,

        title: item.snippet?.title || "Untitled Video",

        channel: item.snippet?.channelTitle || "Unknown Channel",

        channelId: item.snippet?.channelId || channelId,

        channelImage: channelImage,

        subscribers: subscribers,

        thumbnail:
          item.snippet?.thumbnails?.high?.url ||
          item.snippet?.thumbnails?.medium?.url ||
          item.snippet?.thumbnails?.default?.url ||
          "",

        duration: formatDuration(details?.contentDetails?.duration),

        views: details?.statistics?.viewCount || "0",

        publishedAt: item.snippet?.publishedAt || "",
      };
    });
  } catch (error) {
    console.error("Error fetching channel videos:", error);
    return [];
  }
}

/* --------------------------------------------------
   GET CHANNEL DETAILS
-------------------------------------------------- */

export async function getChannelDetails(channelId) {
  try {
    const url =
      `${BASE_URL}/channels?part=snippet,statistics,brandingSettings` +
      `&id=${channelId}` +
      `&key=${API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return null;
    }

    const channel = data.items[0];

    return {
      id: channel.id,

      name: channel.snippet?.title || "Channel",

      description: channel.snippet?.description || "",

      customUrl: channel.snippet?.customUrl || "",

      publishedAt: channel.snippet?.publishedAt || "",

      country: channel.snippet?.country || "",

      profileImage:
        channel.snippet?.thumbnails?.high?.url ||
        channel.snippet?.thumbnails?.medium?.url ||
        channel.snippet?.thumbnails?.default?.url ||
        "",

      banner: channel.brandingSettings?.image?.bannerExternalUrl || "",

      subscribers: channel.statistics?.subscriberCount || "0",

      totalViews: channel.statistics?.viewCount || "0",

      videoCount: channel.statistics?.videoCount || "0",
    };
  } catch (error) {
    console.error("Error fetching channel details:", error);
    return null;
  }
}

/* --------------------------------------------------
   GET CHANNEL SHORTS
-------------------------------------------------- */

export async function getChannelShorts(channelId) {
  try {
    const url =
      `${BASE_URL}/search?part=snippet` +
      `&channelId=${channelId}` +
      `&type=video` +
      `&q=%23shorts` +
      `&order=date` +
      `&maxResults=20` +
      `&key=${API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    const videoIds = (data.items || [])
      .map((item) => item.id?.videoId)
      .filter(Boolean);

    if (videoIds.length === 0) {
      return [];
    }

    /* Get video details */

    const detailsUrl =
      `${BASE_URL}/videos?part=contentDetails,statistics` +
      `&id=${videoIds.join(",")}` +
      `&key=${API_KEY}`;

    const detailsResponse = await fetch(detailsUrl);

    if (!detailsResponse.ok) {
      throw new Error(`HTTP error: ${detailsResponse.status}`);
    }

    const detailsData = await detailsResponse.json();

    const detailsMap = {};

    (detailsData.items || []).forEach((video) => {
      detailsMap[video.id] = video;
    });

    return (data.items || []).map((item) => {
      const videoId = item.id.videoId;

      const details = detailsMap[videoId];

      return {
        id: videoId,

        title: item.snippet?.title || "Untitled Short",

        channel: item.snippet?.channelTitle || "Unknown Channel",

        channelId: item.snippet?.channelId || channelId,

        channelImage: "",

        thumbnail:
          item.snippet?.thumbnails?.high?.url ||
          item.snippet?.thumbnails?.medium?.url ||
          item.snippet?.thumbnails?.default?.url ||
          "",

        duration: formatDuration(details?.contentDetails?.duration),

        views: details?.statistics?.viewCount || "0",

        publishedAt: item.snippet?.publishedAt || "",

        isShort: true,
      };
    });
  } catch (error) {
    console.error("Error fetching channel shorts:", error);
    return [];
  }
}
export async function getShortsVideos() {
  try {
    const url =
      `${BASE_URL}/search?part=snippet` +
      `&q=%23shorts` +
      `&type=video` +
      `&maxResults=20` +
      `&order=date` +
      `&key=${API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    return (data.items || []).map((video) => ({
      id: video.id.videoId,
      title: video.snippet?.title || "Short",
      channel: video.snippet?.channelTitle || "Unknown Channel",
      channelId: video.snippet?.channelId || "",
      channelImage: "",
      thumbnail:
        video.snippet?.thumbnails?.high?.url ||
        video.snippet?.thumbnails?.medium?.url ||
        video.snippet?.thumbnails?.default?.url ||
        "",
      duration: "",
      views: "0",
      publishedAt: video.snippet?.publishedAt || "",
      isShort: true,
    }));
  } catch (error) {
    console.error("Error fetching Shorts:", error);
    return [];
  }
}