const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
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

    likedVideos: {
      type: [String],
      default: [],
    },

    watchLater: {
      type: [String],
      default: [],
    },
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

    // other fields...
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;