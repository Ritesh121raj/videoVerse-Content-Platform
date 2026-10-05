const User = require("../models/User");

// ======================================================
// GET LIKED VIDEOS
// ======================================================

const getLikedVideos = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "likedVideos"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      likedVideos: user.likedVideos || [],
    });
  } catch (error) {
    console.error("Get liked videos error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};


// ======================================================
// ADD LIKED VIDEO
// ======================================================

const addLikedVideo = async (req, res) => {
  try {
    const { videoId } = req.body;

    if (!videoId) {
      return res.status(400).json({
        message: "Video ID is required",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Don't add duplicate
    if (!user.likedVideos.includes(videoId)) {
      user.likedVideos.unshift(videoId);
      await user.save();
    }

    res.status(200).json({
      message: "Video added to liked videos",
      likedVideos: user.likedVideos,
    });
  } catch (error) {
    console.error("Add liked video error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};


// ======================================================
// REMOVE LIKED VIDEO
// ======================================================

const removeLikedVideo = async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!videoId) {
      return res.status(400).json({
        message: "Video ID is required",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.likedVideos =
      user.likedVideos.filter(
        (id) => id !== videoId
      );

    await user.save();

    res.status(200).json({
      message: "Video removed from liked videos",
      likedVideos: user.likedVideos,
    });
  } catch (error) {
    console.error(
      "Remove liked video error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};


// ======================================================
// CLEAR ALL LIKED VIDEOS
// ======================================================

const clearLikedVideos = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.likedVideos = [];

    await user.save();

    res.status(200).json({
      message: "All liked videos cleared",
      likedVideos: [],
    });
  } catch (error) {
    console.error(
      "Clear liked videos error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ======================================================
// GET DISLIKED VIDEOS
// ======================================================

const getDislikedVideos = async (req, res) => {
  try {
    const user = await User.findById(
      req.user.userId
    ).select("dislikedVideos");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      dislikedVideos:
        user.dislikedVideos || [],
    });
  } catch (error) {
    console.error(
      "Get disliked videos error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};


// ======================================================
// ADD DISLIKED VIDEO
// ======================================================

const addDislikedVideo = async (req, res) => {
  try {
    const { video } = req.body;

    if (!video || !video.id) {
      return res.status(400).json({
        message:
          "Complete video object is required",
      });
    }

    const user = await User.findById(
      req.user.userId
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Remove existing occurrence
    // to prevent duplicate disliked videos
    user.dislikedVideos =
      user.dislikedVideos.filter(
        (item) =>
          item &&
          item.id !== video.id
      );

    // Add latest disliked video
    user.dislikedVideos.unshift(video);

    // Keep latest 50
    user.dislikedVideos =
      user.dislikedVideos.slice(0, 50);

    await user.save();

    res.status(200).json({
      message:
        "Video added to disliked videos",

      dislikedVideos:
        user.dislikedVideos,
    });
  } catch (error) {
    console.error(
      "Add disliked video error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};


// ======================================================
// REMOVE DISLIKED VIDEO
// ======================================================

const removeDislikedVideo = async (
  req,
  res
) => {
  try {
    const { videoId } = req.params;

    if (!videoId) {
      return res.status(400).json({
        message: "Video ID is required",
      });
    }

    const user = await User.findById(
      req.user.userId
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.dislikedVideos =
      user.dislikedVideos.filter(
        (item) =>
          item &&
          item.id !== videoId
      );

    await user.save();

    res.status(200).json({
      message:
        "Video removed from disliked videos",

      dislikedVideos:
        user.dislikedVideos,
    });
  } catch (error) {
    console.error(
      "Remove disliked video error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};


// ======================================================
// CLEAR ALL DISLIKED VIDEOS
// ======================================================

const clearDislikedVideos = async (
  req,
  res
) => {
  try {
    const user = await User.findById(
      req.user.userId
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.dislikedVideos = [];

    await user.save();

    res.status(200).json({
      message:
        "All disliked videos cleared",

      dislikedVideos: [],
    });
  } catch (error) {
    console.error(
      "Clear disliked videos error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};
// ======================================================
// GET WATCH HISTORY
// ======================================================

const getHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "history"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      history: user.history || [],
    });
  } catch (error) {
    console.error("Get history error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};


// ======================================================
// ADD VIDEO TO HISTORY
// ======================================================

const addToHistory = async (req, res) => {
  try {
    const { video } = req.body;

    if (!video || !video.id) {
      return res.status(400).json({
        message: "Complete video object is required",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Remove old occurrence of same video
    user.history = user.history.filter(
      (item) => item && item.id !== video.id
    );

    // Add latest watched video at beginning
    user.history.unshift(video);

    // Keep only latest 50 videos
    user.history = user.history.slice(0, 50);

    await user.save();

    res.status(200).json({
      message: "Video added to history",
      history: user.history,
    });
  } catch (error) {
    console.error("Add history error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};


// ======================================================
// REMOVE VIDEO FROM HISTORY
// ======================================================

const removeFromHistory = async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!videoId) {
      return res.status(400).json({
        message: "Video ID is required",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.history = user.history.filter(
      (item) => item && item.id !== videoId
    );

    await user.save();

    res.status(200).json({
      message: "Video removed from history",
      history: user.history,
    });
  } catch (error) {
    console.error(
      "Remove history error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};


// ======================================================
// CLEAR ALL HISTORY
// ======================================================

const clearHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.history = [];

    await user.save();

    res.status(200).json({
      message: "History cleared successfully",
      history: [],
    });
  } catch (error) {
    console.error(
      "Clear history error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
};


module.exports = {
  // LIKED VIDEOS
  getLikedVideos,
  addLikedVideo,
  removeLikedVideo,
  clearLikedVideos,

  // DISLIKED VIDEOS
  getDislikedVideos,
  addDislikedVideo,
  removeDislikedVideo,
  clearDislikedVideos,

  // HISTORY
  getHistory,
  addToHistory,
  removeFromHistory,
  clearHistory,
};