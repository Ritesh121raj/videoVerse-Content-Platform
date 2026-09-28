const express = require("express");

const {
  getShortsVideos,
  getMusicVideos,
} = require("../controllers/videoController");

const router = express.Router();

// Shorts
router.get(
  "/shorts",
  getShortsVideos
);

// Music
router.get(
  "/music",
  getMusicVideos
);

module.exports = router;