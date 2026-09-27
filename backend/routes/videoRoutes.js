const express = require("express");

const {
  getShortsVideos,
} = require("../controllers/videoController");

const router = express.Router();

// ======================================================
// GET SHORTS
// ======================================================

router.get("/shorts", getShortsVideos);

module.exports = router;