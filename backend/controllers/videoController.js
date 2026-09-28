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

    // ==================================================
    // CHECK API KEY
    // ==================================================

    if (!API_KEY) {
      return res.status(500).json({
        message:
          "YOUTUBE_API_KEY is missing in backend .env",
      });
    }

    // ==================================================
    // STEP 1: GET MOST POPULAR VIDEOS
    //
    // IMPORTANT:
    // We intentionally DO NOT use /search here.
    //
    // /search is expensive and caused quota exhaustion.
    // /videos?chart=mostPopular is much cheaper.
    // ==================================================

    const params = new URLSearchParams({
      part: "snippet,contentDetails,statistics",
      chart: "mostPopular",
      regionCode: "IN",
      maxResults: "50",
      key: API_KEY,
    });

    const url =
      `https://www.googleapis.com/youtube/v3/videos?${params.toString()}`;

    console.log(
      "SHORTS: Fetching popular videos without Search API..."
    );

    const response = await fetch(url);

    const data = await response
      .json()
      .catch(() => null);

    // ==================================================
    // HANDLE YOUTUBE API ERROR
    // ==================================================

    if (!response.ok) {
      console.error(
        "SHORTS YOUTUBE API ERROR:",
        data
      );

      return res.status(response.status).json({
        message:
          data?.error?.message ||
          "Failed to fetch Shorts from YouTube",
      });
    }

    // ==================================================
    // STEP 2: CHECK VIDEOS
    // ==================================================

    const videos = data?.items || [];

    console.log(
      "SHORTS: Popular videos received:",
      videos.length
    );

    if (videos.length === 0) {
      return res.status(200).json({
        shorts: [],
      });
    }

    // ==================================================
    // STEP 3: DURATION CONVERTER
    // ==================================================

    const getDurationInSeconds = (duration) => {
      if (!duration) {
        return 0;
      }

      const match = duration.match(
        /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
      );

      if (!match) {
        return 0;
      }

      const hours = parseInt(
        match[1] || 0,
        10
      );

      const minutes = parseInt(
        match[2] || 0,
        10
      );

      const seconds = parseInt(
        match[3] || 0,
        10
      );

      return (
        hours * 3600 +
        minutes * 60 +
        seconds
      );
    };

    // ==================================================
    // STEP 4: FILTER SHORTS
    // ==================================================

    const shorts = videos
      .filter((video) => {
        const duration =
          video.contentDetails?.duration || "";

        const durationInSeconds =
          getDurationInSeconds(duration);

        const title =
          video.snippet?.title || "";

        // YouTube Shorts:
        // - duration <= 180 seconds
        // - OR #shorts in title
        return (
          (
            durationInSeconds > 0 &&
            durationInSeconds <= 180
          ) ||
          /#shorts/i.test(title)
        );
      })
      .map((video) => ({
        id: video.id,

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
          video.contentDetails?.duration ||
          "",

        views:
          video.statistics?.viewCount ||
          "0",

        publishedAt:
          video.snippet?.publishedAt ||
          "",

        isShort: true,
      }));

    // ==================================================
    // STEP 5: REMOVE DUPLICATES
    // ==================================================

    const uniqueShorts = Array.from(
      new Map(
        shorts.map((video) => [
          video.id,
          video,
        ])
      ).values()
    );

    console.log(
      "SHORTS FINAL COUNT:",
      uniqueShorts.length
    );

    // ==================================================
    // STEP 6: SEND RESPONSE
    // ==================================================

    return res.status(200).json({
      shorts: uniqueShorts,
    });

  } catch (error) {
    console.error(
      "GET SHORTS BACKEND ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching Shorts",
    });
  }
};

module.exports = {
  getShortsVideos,
};