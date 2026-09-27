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
// GET SHORTS
// ======================================================

const getShortsVideos = async (req, res) => {
  try {
    const API_KEY = process.env.YOUTUBE_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({
        message: "YouTube API key is not configured",
      });
    }

    // ==================================================
    // STEP 1: SEARCH SHORTS
    // ==================================================

    const searchUrl =
      "https://www.googleapis.com/youtube/v3/search" +
      "?part=snippet" +
      "&q=%23shorts" +
      "&type=video" +
      "&maxResults=20" +
      "&order=date" +
      `&key=${API_KEY}`;

    const searchResponse = await fetch(searchUrl);

    if (!searchResponse.ok) {
      const errorData = await searchResponse
        .json()
        .catch(() => null);

      return res.status(searchResponse.status).json({
        message:
          errorData?.error?.message ||
          getApiErrorMessage(searchResponse.status),
      });
    }

    const searchData = await searchResponse.json();

    const videoIds = (searchData.items || [])
      .map((item) => item.id?.videoId)
      .filter(Boolean);

    if (videoIds.length === 0) {
      return res.status(200).json({
        shorts: [],
      });
    }

    // ==================================================
    // STEP 2: GET VIDEO DETAILS
    // ==================================================

    const detailsUrl =
      "https://www.googleapis.com/youtube/v3/videos" +
      "?part=snippet,contentDetails,statistics" +
      `&id=${videoIds.join(",")}` +
      `&key=${API_KEY}`;

    const detailsResponse = await fetch(detailsUrl);

    if (!detailsResponse.ok) {
      const errorData = await detailsResponse
        .json()
        .catch(() => null);

      return res.status(detailsResponse.status).json({
        message:
          errorData?.error?.message ||
          getApiErrorMessage(detailsResponse.status),
      });
    }

    const detailsData = await detailsResponse.json();

    // ==================================================
    // STEP 3: CREATE DETAILS LOOKUP
    // ==================================================

    const detailsMap = {};

    (detailsData.items || []).forEach((video) => {
      detailsMap[video.id] = video;
    });

    // ==================================================
    // STEP 4: FORMAT SHORTS
    // ==================================================

    const shorts = (searchData.items || [])
      .map((item) => {
        const videoId = item.id?.videoId;

        if (!videoId) {
          return null;
        }

        const details = detailsMap[videoId];

        const rawDuration =
          details?.contentDetails?.duration || "";

        return {
          id: videoId,

          title:
            item.snippet?.title ||
            "Short",

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

          duration: rawDuration,

          views:
            details?.statistics?.viewCount ||
            "0",

          publishedAt:
            item.snippet?.publishedAt ||
            "",

          isShort: true,
        };
      })
      .filter(Boolean);

    return res.status(200).json({
      shorts,
    });

  } catch (error) {
    console.error(
      "Get Shorts backend error:",
      error
    );

    return res.status(500).json({
      message: "Server error while fetching Shorts",
    });
  }
};


module.exports = {
  getShortsVideos,
};