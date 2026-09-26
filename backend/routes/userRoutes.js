const express = require("express");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ======================================================
// GET LOGGED-IN USER'S LIKED VIDEOS
// ======================================================

router.get("/liked", protect, async (req, res) => {
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
});


// ======================================================
// ADD VIDEO TO LIKED VIDEOS
// ======================================================

router.post("/liked", protect, async (req, res) => {
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

    // Avoid duplicate video IDs
    if (!user.likedVideos.includes(videoId)) {
      user.likedVideos.push(videoId);
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
});


// ======================================================
// REMOVE VIDEO FROM LIKED VIDEOS
// ======================================================

router.delete("/liked/:videoId", protect, async (req, res) => {
  try {
    const { videoId } = req.params;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.likedVideos = user.likedVideos.filter(
      (id) => id !== videoId
    );

    await user.save();

    res.status(200).json({
      message: "Video removed from liked videos",
      likedVideos: user.likedVideos,
    });
  } catch (error) {
    console.error("Remove liked video error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});
// ======================================================
// GET LOGGED-IN USER'S WATCH LATER VIDEOS
// ======================================================

router.get("/watch-later", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "watchLater"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      watchLater: user.watchLater || [],
    });
  } catch (error) {
    console.error(
      "Get watch later videos error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
});


// ======================================================
// ADD VIDEO TO WATCH LATER
// ======================================================

router.post("/watch-later", protect, async (req, res) => {
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

    if (!user.watchLater.includes(videoId)) {
      user.watchLater.push(videoId);
      await user.save();
    }

    res.status(200).json({
      message: "Video added to Watch Later",
      watchLater: user.watchLater,
    });
  } catch (error) {
    console.error(
      "Add watch later video error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
});


// ======================================================
// REMOVE VIDEO FROM WATCH LATER
// ======================================================

router.delete(
  "/watch-later/:videoId",
  protect,
  async (req, res) => {
    try {
      const { videoId } = req.params;

      const user = await User.findById(
        req.user.userId
      );

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      user.watchLater =
        user.watchLater.filter(
          (id) => id !== videoId
        );

      await user.save();

      res.status(200).json({
        message:
          "Video removed from Watch Later",
        watchLater: user.watchLater,
      });
    } catch (error) {
      console.error(
        "Remove watch later video error:",
        error
      );

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

module.exports = router;