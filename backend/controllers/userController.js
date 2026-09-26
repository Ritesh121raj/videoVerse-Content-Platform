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


module.exports = {
  getLikedVideos,
  addLikedVideo,
  removeLikedVideo,
  clearLikedVideos,
};