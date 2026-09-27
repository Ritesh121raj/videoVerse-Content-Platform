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
        message: "Video removed from Watch Later",
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

// ======================================================
// GET LOGGED-IN USER'S SUBSCRIBED CHANNELS
// ======================================================

router.get(
  "/subscriptions",
  protect,
  async (req, res) => {
    try {
      const user = await User.findById(
        req.user.userId
      ).select("subscribedChannels");

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      res.status(200).json({
        subscribedChannels:
          user.subscribedChannels || [],
      });
    } catch (error) {
      console.error(
        "Get subscriptions error:",
        error
      );

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// ======================================================
// SUBSCRIBE TO CHANNEL
// ======================================================

router.post(
  "/subscriptions",
  protect,
  async (req, res) => {
    try {
      const { channelId } = req.body;

      if (!channelId) {
        return res.status(400).json({
          message: "Channel ID is required",
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

      // Avoid duplicate subscriptions
      if (
        !user.subscribedChannels.includes(
          channelId
        )
      ) {
        user.subscribedChannels.push(
          channelId
        );

        await user.save();
      }

      res.status(200).json({
        message:
          "Channel subscribed successfully",
        subscribedChannels:
          user.subscribedChannels,
      });
    } catch (error) {
      console.error(
        "Subscribe channel error:",
        error
      );

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// ======================================================
// UNSUBSCRIBE FROM CHANNEL
// ======================================================

router.delete(
  "/subscriptions/:channelId",
  protect,
  async (req, res) => {
    try {
      const { channelId } = req.params;

      const user = await User.findById(
        req.user.userId
      );

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      user.subscribedChannels =
        user.subscribedChannels.filter(
          (id) => id !== channelId
        );

      await user.save();

      res.status(200).json({
        message:
          "Channel unsubscribed successfully",
        subscribedChannels:
          user.subscribedChannels,
      });
    } catch (error) {
      console.error(
        "Unsubscribe channel error:",
        error
      );

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);
// ======================================================
// GET LOGGED-IN USER'S PLAYLISTS
// ======================================================

router.get("/playlists", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "playlists"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      playlists: user.playlists || [],
    });
  } catch (error) {
    console.error("Get playlists error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});


// ======================================================
// CREATE PLAYLIST
// ======================================================

router.post("/playlists", protect, async (req, res) => {
  try {
    const {
      id,
      name,
      description,
      videos,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Playlist name is required",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const playlist = {
      id: id || `playlist-${Date.now()}`,
      name: name.trim(),
      description: description?.trim() || "",
      videos: Array.isArray(videos) ? videos : [],
      createdAt: new Date(),
    };

    user.playlists.push(playlist);

    await user.save();

    res.status(201).json({
      message: "Playlist created successfully",
      playlist,
      playlists: user.playlists,
    });
  } catch (error) {
    console.error("Create playlist error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});


// ======================================================
// DELETE PLAYLIST
// ======================================================

router.delete(
  "/playlists/:playlistId",
  protect,
  async (req, res) => {
    try {
      const { playlistId } = req.params;

      const user = await User.findById(
        req.user.userId
      );

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const playlistExists =
        user.playlists.some(
          (playlist) =>
            playlist.id === playlistId
        );

      if (!playlistExists) {
        return res.status(404).json({
          message: "Playlist not found",
        });
      }

      user.playlists =
        user.playlists.filter(
          (playlist) =>
            playlist.id !== playlistId
        );

      await user.save();

      res.status(200).json({
        message: "Playlist deleted successfully",
        playlists: user.playlists,
      });
    } catch (error) {
      console.error(
        "Delete playlist error:",
        error
      );

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);


module.exports = router;

