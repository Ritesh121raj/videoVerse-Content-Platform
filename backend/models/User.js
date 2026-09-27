const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ==================================================
    // BASIC USER INFORMATION
    // ==================================================

    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    // ==================================================
    // LIKED VIDEOS
    // ==================================================

    likedVideos: {
      type: [String],
      default: [],
    },

    // ==================================================
    // WATCH LATER
    // ==================================================

    watchLater: {
      type: [String],
      default: [],
    },

    // ==================================================
    // SUBSCRIBED CHANNELS
    // ==================================================

    subscribedChannels: {
      type: [String],
      default: [],
    },

    // ==================================================
    // PLAYLISTS
    // ==================================================

    playlists: [
      {
        id: {
          type: String,
          required: true,
        },

        name: {
          type: String,
          required: true,
        },

        description: {
          type: String,
          default: "",
        },

        videos: {
          type: [String],
          default: [],
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },

  {
    timestamps: true,
  }
);

const User = mongoose.model(
  "User",
  userSchema
);

module.exports = User;