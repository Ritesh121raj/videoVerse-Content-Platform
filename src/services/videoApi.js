const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

const BASE_URL = "https://www.googleapis.com/youtube/v3";
const getApiErrorMessage = (status) => {
  switch (status) {
    case 400:
      return "Invalid YouTube API request.";

    case 401:
      return "YouTube API authentication failed.";

    case 403:
      return "YouTube API access denied or quota exceeded.";

    case 404:
      return "Requested YouTube resource was not found.";

    case 429:
      return "YouTube API quota exceeded. Please try again later.";

    case 500:
    case 502:
    case 503:
      return "YouTube service is temporarily unavailable.";

    default:
      return `YouTube API error (${status}).`;
  }
};


// ======================================================
// Format YouTube Duration
// ======================================================

function formatDuration(duration) {
  if (!duration) return "";

  const match = duration.match(
    /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
  );

  if (!match) return "";

  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
function getDurationInSeconds(duration) {
  if (!duration) {
    return 0;
  }

  const match = duration.match(
    /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
  );

  if (!match) {
    return 0;
  }

  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);

  return (
    hours * 3600 +
    minutes * 60 +
    seconds
  );
}


// ======================================================
// Get Home Videos
// ======================================================

export const getVideos = async () => {
  try {
    const searchResponse = await fetch(
      `${BASE_URL}/search?part=snippet&q=programming&type=video&maxResults=20&key=${API_KEY}`
    );

    if (!searchResponse.ok) {
      const errorData = await searchResponse.json().catch(() => null);

      const error = new Error(
        errorData?.error?.message ||
          getApiErrorMessage(searchResponse.status)
      );

      error.status = searchResponse.status;
      error.reason =
        errorData?.error?.errors?.[0]?.reason || null;

      throw error;
    }

    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      return [];
    }

    const videoIds = searchData.items
      .map((item) => item.id?.videoId)
      .filter(Boolean)
      .join(",");

    if (!videoIds) {
      return [];
    }

    const detailsResponse = await fetch(
      `${BASE_URL}/videos?part=contentDetails,statistics,snippet&id=${videoIds}&key=${API_KEY}`
    );

    if (!detailsResponse.ok) {
      const errorData = await detailsResponse.json().catch(() => null);

      const error = new Error(
        errorData?.error?.message ||
          getApiErrorMessage(detailsResponse.status)
      );

      error.status = detailsResponse.status;
      error.reason =
        errorData?.error?.errors?.[0]?.reason || null;

      throw error;
    }

    const detailsData = await detailsResponse.json();

    const videos = detailsData.items.map((item) => {
      const searchItem = searchData.items.find(
        (search) =>
          search.id?.videoId === item.id
      );

      return {
        id: item.id,

        title: item.snippet?.title || "",

        channel:
          item.snippet?.channelTitle || "",

        channelId:
          item.snippet?.channelId || "",

        channelImage: "",

        thumbnail:
          item.snippet?.thumbnails?.high?.url ||
          item.snippet?.thumbnails?.medium?.url ||
          item.snippet?.thumbnails?.default?.url ||
          "",

        image:
          item.snippet?.thumbnails?.high?.url ||
          item.snippet?.thumbnails?.medium?.url ||
          item.snippet?.thumbnails?.default?.url ||
          "",

        duration:
          formatDuration(
            item.contentDetails?.duration || ""
          ),

        views:
          item.statistics?.viewCount || "0",

        publishedAt:
          item.snippet?.publishedAt || "",

        description:
          item.snippet?.description || "",

        categoryId:
          item.snippet?.categoryId || "",

        searchItem,
      };
    });

    return videos;
  } catch (error) {
    console.error("getVideos error:", error);

    // Error ko silently [] me convert nahi karenge.
    // Caller ko actual error milega.
    throw error;
  }
};

// ======================================================
// Get Video By ID
// ======================================================

export async function getVideoById(videoId) {
  try {
    // ==========================================
    // Get Video Details
    // ==========================================

    const videoUrl =
      `${BASE_URL}/videos?part=snippet,contentDetails,statistics` +
      `&id=${videoId}` +
      `&key=${API_KEY}`;

    const videoResponse = await fetch(videoUrl);

    if (!videoResponse.ok) {
      const errorData =
        await videoResponse.json().catch(() => null);

      const error = new Error(
        errorData?.error?.message ||
          getApiErrorMessage(videoResponse.status)
      );

      error.status = videoResponse.status;
      error.reason =
        errorData?.error?.errors?.[0]?.reason || null;

      throw error;
    }

    const videoData = await videoResponse.json();

    if (
      !videoData.items ||
      videoData.items.length === 0
    ) {
      return null;
    }

    const video = videoData.items[0];

    // ==========================================
    // Get Channel Details
    // ==========================================

    const channelId =
      video.snippet?.channelId;

    let channelData = null;

    if (channelId) {
      const channelUrl =
        `${BASE_URL}/channels?part=snippet,statistics` +
        `&id=${channelId}` +
        `&key=${API_KEY}`;

      const channelResponse =
        await fetch(channelUrl);

      if (!channelResponse.ok) {
        const errorData =
          await channelResponse.json().catch(() => null);

        const error = new Error(
          errorData?.error?.message ||
            getApiErrorMessage(channelResponse.status)
        );

        error.status = channelResponse.status;
        error.reason =
          errorData?.error?.errors?.[0]?.reason || null;

        throw error;
      }

      const channelResult =
        await channelResponse.json();

      if (
        channelResult.items &&
        channelResult.items.length > 0
      ) {
        channelData =
          channelResult.items[0];
      }
    }

    // ==========================================
    // Return Complete Video Data
    // ==========================================

    return {
      id: video.id,

      title:
        video.snippet?.title ||
        "Untitled",

      channel:
        video.snippet?.channelTitle ||
        "Unknown Channel",

      channelId:
        channelId || "",

      channelImage:
        channelData?.snippet?.thumbnails?.high?.url ||
        channelData?.snippet?.thumbnails?.medium?.url ||
        channelData?.snippet?.thumbnails?.default?.url ||
        "",

      subscribers:
        channelData?.statistics?.subscriberCount ||
        "0",

      thumbnail:
        video.snippet?.thumbnails?.high?.url ||
        video.snippet?.thumbnails?.medium?.url ||
        video.snippet?.thumbnails?.default?.url ||
        "",

      duration:
        formatDuration(
          video.contentDetails?.duration
        ),

      views:
        video.statistics?.viewCount ||
        "0",

      likes:
        video.statistics?.likeCount ||
        "0",

      publishedAt:
        video.snippet?.publishedAt ||
        "",
    };

  } catch (error) {
    console.error(
      "Error fetching video:",
      error
    );

    // Important:
    // API error ko silently null me convert nahi karenge.
    throw error;
  }
}

// ======================================================
// Search Videos
// ======================================================

export async function searchVideos(query) {
  try {
    // Step 1: Search videos
    const searchUrl =
      `${BASE_URL}/search?part=snippet` +
      `&q=${encodeURIComponent(query)}` +
      `&type=video` +
      `&maxResults=20` +
      `&key=${API_KEY}`;

    const searchResponse = await fetch(searchUrl);

    if (!searchResponse.ok) {
      const errorData =
        await searchResponse.json().catch(() => null);

      const error = new Error(
        errorData?.error?.message ||
          getApiErrorMessage(searchResponse.status)
      );

      error.status = searchResponse.status;
      error.reason =
        errorData?.error?.errors?.[0]?.reason || null;

      throw error;
    }

    const searchData = await searchResponse.json();

    const videoIds = (searchData.items || [])
      .map((item) => item.id?.videoId)
      .filter(Boolean);

    if (videoIds.length === 0) {
      return [];
    }

    // Step 2: Get duration + views
    const detailsUrl =
      `${BASE_URL}/videos?part=contentDetails,statistics` +
      `&id=${videoIds.join(",")}` +
      `&key=${API_KEY}`;

    const detailsResponse = await fetch(detailsUrl);

    if (!detailsResponse.ok) {
      const errorData =
        await detailsResponse.json().catch(() => null);

      const error = new Error(
        errorData?.error?.message ||
          getApiErrorMessage(detailsResponse.status)
      );

      error.status = detailsResponse.status;
      error.reason =
        errorData?.error?.errors?.[0]?.reason || null;

      throw error;
    }

    const detailsData = await detailsResponse.json();

    // Step 3: Create a lookup for video details
    const detailsMap = {};

    (detailsData.items || []).forEach((video) => {
      detailsMap[video.id] = video;
    });

    // Step 4: Combine search data + details
    return (searchData.items || []).map((item) => {
      const videoId = item.id.videoId;
      const details = detailsMap[videoId];

      const rawDuration =
        details?.contentDetails?.duration || "";

      /*
       * Detect Shorts.
       *
       * Primary check:
       * - #shorts in title
       *
       * Secondary check:
       * - video duration <= 180 seconds
       */
      const isShort =
        /#shorts/i.test(
          item.snippet?.title || ""
        ) ||
        getDurationInSeconds(rawDuration) <= 180;

      return {
        id: videoId,

        title:
          item.snippet?.title ||
          "Untitled Video",

        channel:
          item.snippet?.channelTitle ||
          "Unknown Channel",

        channelId:
          item.snippet?.channelId ||
          "",

        channelImage:
          item.snippet?.thumbnails?.default?.url ||
          "",

        thumbnail:
          item.snippet?.thumbnails?.high?.url ||
          item.snippet?.thumbnails?.medium?.url ||
          item.snippet?.thumbnails?.default?.url ||
          "",

        duration:
          formatDuration(rawDuration),

        views:
          details?.statistics?.viewCount ||
          "0",

        publishedAt:
          item.snippet?.publishedAt ||
          "",

        // Used by Search page filters
        isShort,
      };
    });
  } catch (error) {
    console.error(
      "Error searching videos:",
      error
    );

    // Pass the actual API error to the caller
    throw error;
  }
}

// ======================================================
// Category Videos
// ======================================================

export async function getCategoryVideos(category) {
  return searchVideos(category);
}


// ======================================================
// Trending Videos
// ======================================================

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
      const errorData =
        await response.json().catch(() => null);

      const error = new Error(
        errorData?.error?.message ||
          getApiErrorMessage(response.status)
      );

      error.status = response.status;
      error.reason =
        errorData?.error?.errors?.[0]?.reason || null;

      throw error;
    }

    const data = await response.json();

    const videos = data.items || [];

    if (videos.length === 0) {
      return [];
    }

    // Get unique channel IDs
    const channelIds = [
      ...new Set(
        videos
          .map((video) => video.snippet?.channelId)
          .filter(Boolean)
      ),
    ];

    // Get channel profile images
    let channelImages = {};

    if (channelIds.length > 0) {
      const channelUrl =
        `${BASE_URL}/channels?part=snippet` +
        `&id=${channelIds.join(",")}` +
        `&key=${API_KEY}`;

      const channelResponse =
        await fetch(channelUrl);

      if (!channelResponse.ok) {
        const errorData =
          await channelResponse.json().catch(() => null);

        const error = new Error(
          errorData?.error?.message ||
            getApiErrorMessage(channelResponse.status)
        );

        error.status = channelResponse.status;
        error.reason =
          errorData?.error?.errors?.[0]?.reason || null;

        throw error;
      }

      const channelData =
        await channelResponse.json();

      (channelData.items || []).forEach((channel) => {
        channelImages[channel.id] =
          channel.snippet?.thumbnails?.default?.url ||
          channel.snippet?.thumbnails?.medium?.url ||
          channel.snippet?.thumbnails?.high?.url ||
          "";
      });
    }

    return videos.map((video) => ({
      id: video.id,

      title:
        video.snippet?.title ||
        "Untitled Video",

      channel:
        video.snippet?.channelTitle ||
        "Unknown Channel",

      channelId:
        video.snippet?.channelId ||
        "",

      channelImage:
        channelImages[video.snippet?.channelId] ||
        "",

      thumbnail:
        video.snippet?.thumbnails?.high?.url ||
        video.snippet?.thumbnails?.medium?.url ||
        video.snippet?.thumbnails?.default?.url ||
        "",

      duration:
        formatDuration(
          video.contentDetails?.duration
        ),

      views:
        video.statistics?.viewCount ||
        "0",

      publishedAt:
        video.snippet?.publishedAt ||
        "",
    }));
  } catch (error) {
    console.error(
      "Error fetching trending videos:",
      error
    );

    throw error;
  }
}
// ======================================================
// ⭐ GET CHANNEL DETAILS
// ======================================================

export async function getChannelDetails(channelId) {
  try {
    const url =
      `${BASE_URL}/channels?part=snippet,statistics,brandingSettings` +
      `&id=${channelId}` +
      `&key=${API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorData =
        await response.json().catch(() => null);

      const error = new Error(
        errorData?.error?.message ||
          getApiErrorMessage(response.status)
      );

      error.status = response.status;
      error.reason =
        errorData?.error?.errors?.[0]?.reason || null;

      throw error;
    }

    const data = await response.json();

    console.log(
      "CHANNEL DETAILS:",
      data
    );

    if (
      !data.items ||
      data.items.length === 0
    ) {
      return null;
    }

    const channel = data.items[0];

    const snippet =
      channel.snippet || {};

    const statistics =
      channel.statistics || {};

    const imageSettings =
      channel.brandingSettings?.image || {};

    // =========================================
    // PROFILE IMAGE
    // =========================================

    const profileImage =
      snippet.thumbnails?.high?.url ||
      snippet.thumbnails?.medium?.url ||
      snippet.thumbnails?.default?.url ||
      "";

    // =========================================
    // BANNER
    // =========================================

    const banner =
      imageSettings.bannerImageUrl ||
      imageSettings.bannerTabletExtraHdImageUrl ||
      imageSettings.bannerTabletHdImageUrl ||
      imageSettings.bannerTabletImageUrl ||
      imageSettings.bannerMobileExtraHdImageUrl ||
      imageSettings.bannerMobileHdImageUrl ||
      imageSettings.bannerMobileImageUrl ||
      imageSettings.bannerExternalUrl ||
      "";

    // =========================================
    // RETURN CHANNEL DATA
    // =========================================

    return {
      id: channel.id,

      name:
        snippet.title ||
        "Channel",

      description:
        snippet.description ||
        "",

      customUrl:
        snippet.customUrl ||
        "",

      publishedAt:
        snippet.publishedAt ||
        "",

      country:
        snippet.country ||
        "",

      profileImage:
        profileImage,

      banner:
        banner,

      subscribers:
        statistics.subscriberCount ||
        "0",

      totalViews:
        statistics.viewCount ||
        "0",

      videoCount:
        statistics.videoCount ||
        "0",
    };

  } catch (error) {
    console.error(
      "Error fetching channel details:",
      error
    );

    throw error;
  }
}
export async function getChannelVideos(
  channelId,
  channelImage = ""
) {
  try {
    // First get videos from this channel
    const searchUrl =
      `${BASE_URL}/search?part=snippet` +
      `&channelId=${channelId}` +
      `&type=video` +
      `&order=date` +
      `&maxResults=20` +
      `&key=${API_KEY}`;

    const searchResponse = await fetch(searchUrl);

    if (!searchResponse.ok) {
      const errorData =
        await searchResponse.json().catch(() => null);

      const error = new Error(
        errorData?.error?.message ||
          getApiErrorMessage(searchResponse.status)
      );

      error.status = searchResponse.status;
      error.reason =
        errorData?.error?.errors?.[0]?.reason || null;

      throw error;
    }

    const searchData =
      await searchResponse.json();

    const videoIds = (searchData.items || [])
      .map((item) => item.id?.videoId)
      .filter(Boolean);

    if (videoIds.length === 0) {
      return [];
    }

    // Get duration, views, etc.
    const detailsUrl =
      `${BASE_URL}/videos?part=contentDetails,statistics,snippet` +
      `&id=${videoIds.join(",")}` +
      `&key=${API_KEY}`;

    const detailsResponse =
      await fetch(detailsUrl);

    if (!detailsResponse.ok) {
      const errorData =
        await detailsResponse.json().catch(() => null);

      const error = new Error(
        errorData?.error?.message ||
          getApiErrorMessage(detailsResponse.status)
      );

      error.status = detailsResponse.status;
      error.reason =
        errorData?.error?.errors?.[0]?.reason || null;

      throw error;
    }

    const detailsData =
      await detailsResponse.json();

    return (detailsData.items || []).map(
      (video) => ({
        id: video.id,

        title:
          video.snippet?.title ||
          "Untitled Video",

        channel:
          video.snippet?.channelTitle ||
          "Unknown Channel",

        channelId:
          video.snippet?.channelId ||
          channelId,

        channelImage: channelImage,

        thumbnail:
          video.snippet?.thumbnails?.high?.url ||
          video.snippet?.thumbnails?.medium?.url ||
          video.snippet?.thumbnails?.default?.url ||
          "",

        duration: formatDuration(
          video.contentDetails?.duration
        ),

        views:
          video.statistics?.viewCount ||
          "0",

        publishedAt:
          video.snippet?.publishedAt ||
          "",
      })
    );

  } catch (error) {
    console.error(
      "Error fetching channel videos:",
      error
    );

    throw error;
  }
}

// ======================================================
// Get Channel Shorts
// ======================================================

export async function getChannelShorts(
  channelId,
  channelImage = ""
) {
  try {
    const searchUrl =
      `${BASE_URL}/search?part=snippet` +
      `&channelId=${channelId}` +
      `&q=%23shorts` +
      `&type=video` +
      `&order=date` +
      `&maxResults=20` +
      `&key=${API_KEY}`;

    const response = await fetch(searchUrl);

    if (!response.ok) {
      const errorData =
        await response.json().catch(() => null);

      const error = new Error(
        errorData?.error?.message ||
          getApiErrorMessage(response.status)
      );

      error.status = response.status;
      error.reason =
        errorData?.error?.errors?.[0]?.reason || null;

      throw error;
    }

    const data = await response.json();

    const videoIds = (data.items || [])
      .map((video) => video.id?.videoId)
      .filter(Boolean);

    if (videoIds.length === 0) {
      return [];
    }

    const detailsUrl =
      `${BASE_URL}/videos?part=snippet,contentDetails,statistics` +
      `&id=${videoIds.join(",")}` +
      `&key=${API_KEY}`;

    const detailsResponse =
      await fetch(detailsUrl);

    if (!detailsResponse.ok) {
      const errorData =
        await detailsResponse.json().catch(() => null);

      const error = new Error(
        errorData?.error?.message ||
          getApiErrorMessage(detailsResponse.status)
      );

      error.status = detailsResponse.status;
      error.reason =
        errorData?.error?.errors?.[0]?.reason || null;

      throw error;
    }

    const detailsData =
      await detailsResponse.json();

    return (detailsData.items || []).map(
      (video) => ({
        id: video.id,

        title:
          video.snippet?.title ||
          "Short",

        channel:
          video.snippet?.channelTitle ||
          "Unknown Channel",

        channelId:
          video.snippet?.channelId ||
          channelId,

        channelImage: "",

        thumbnail:
          video.snippet?.thumbnails?.high?.url ||
          video.snippet?.thumbnails?.medium?.url ||
          video.snippet?.thumbnails?.default?.url ||
          "",

        duration:
          formatDuration(
            video.contentDetails?.duration
          ),

        views:
          video.statistics?.viewCount ||
          "0",

        publishedAt:
          video.snippet?.publishedAt ||
          "",

        isShort: true,
      })
    );

  } catch (error) {
    console.error(
      "Error fetching channel shorts:",
      error
    );

    throw error;
  }
}

// ======================================================
// Get Shorts
// ======================================================

export async function getShortsVideos() {
  try {
    // Step 1: Search Shorts
    const searchUrl =
      `${BASE_URL}/search?part=snippet` +
      `&q=%23shorts` +
      `&type=video` +
      `&maxResults=20` +
      `&order=date` +
      `&key=${API_KEY}`;

    const response = await fetch(searchUrl);

    if (!response.ok) {
      const errorData =
        await response.json().catch(() => null);

      const error = new Error(
        errorData?.error?.message ||
          getApiErrorMessage(response.status)
      );

      error.status = response.status;
      error.reason =
        errorData?.error?.errors?.[0]?.reason || null;

      throw error;
    }

    const data = await response.json();

    const videoIds = (data.items || [])
      .map((video) => video.id?.videoId)
      .filter(Boolean);

    if (videoIds.length === 0) {
      return [];
    }

    // Step 2: Get duration + views
    const detailsUrl =
      `${BASE_URL}/videos?part=contentDetails,statistics` +
      `&id=${videoIds.join(",")}` +
      `&key=${API_KEY}`;

    const detailsResponse =
      await fetch(detailsUrl);

    if (!detailsResponse.ok) {
      const errorData =
        await detailsResponse.json().catch(() => null);

      const error = new Error(
        errorData?.error?.message ||
          getApiErrorMessage(detailsResponse.status)
      );

      error.status = detailsResponse.status;
      error.reason =
        errorData?.error?.errors?.[0]?.reason || null;

      throw error;
    }

    const detailsData =
      await detailsResponse.json();

    // Step 3: Create lookup
    const detailsMap = {};

    (detailsData.items || []).forEach((video) => {
      detailsMap[video.id] = video;
    });

    // Step 4: Combine search + details
    return (data.items || []).map((video) => {
      const videoId = video.id?.videoId;
      const details = detailsMap[videoId];

      const rawDuration =
        details?.contentDetails?.duration || "";

      return {
        id: videoId,

        title:
          video.snippet?.title ||
          "Short",

        channel:
          video.snippet?.channelTitle ||
          "Unknown Channel",

        channelId:
          video.snippet?.channelId ||
          "",

        channelImage:
          video.snippet?.thumbnails?.default?.url ||
          "",

        thumbnail:
          video.snippet?.thumbnails?.high?.url ||
          video.snippet?.thumbnails?.medium?.url ||
          video.snippet?.thumbnails?.default?.url ||
          "",

        duration:
          formatDuration(rawDuration),

        views:
          details?.statistics?.viewCount ||
          "0",

        publishedAt:
          video.snippet?.publishedAt ||
          "",

        isShort: true,
      };
    });

  } catch (error) {
    console.error(
      "Error fetching Shorts:",
      error
    );

    throw error;
  }
}
export async function getChannelImages(channelIds) {
  try {
    if (!channelIds || channelIds.length === 0) {
      return {};
    }

    const url =
      `${BASE_URL}/channels?part=snippet` +
      `&id=${channelIds.join(",")}` +
      `&key=${API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorData =
        await response.json().catch(() => null);

      const error = new Error(
        errorData?.error?.message ||
          getApiErrorMessage(response.status)
      );

      error.status = response.status;
      error.reason =
        errorData?.error?.errors?.[0]?.reason || null;

      throw error;
    }

    const data = await response.json();

    const channelImages = {};

    (data.items || []).forEach((channel) => {
      const thumbnails =
        channel.snippet?.thumbnails;

      if (!thumbnails) {
        channelImages[channel.id] = "";
        return;
      }

      // Prefer medium instead of high
      const image =
        thumbnails.medium?.url ||
        thumbnails.default?.url ||
        thumbnails.high?.url ||
        "";

      channelImages[channel.id] = image;
    });

    console.log(
      "FRESH CHANNEL IMAGES:",
      channelImages
    );

    return channelImages;

  } catch (error) {
    console.error(
      "Error fetching channel images:",
      error
    );

    throw error;
  }
}