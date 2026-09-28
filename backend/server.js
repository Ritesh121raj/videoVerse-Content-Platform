const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const videoRoutes = require("./routes/videoRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/user", userRoutes);

app.use("/api/videos", videoRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "videoVerse Backend is running 🚀",
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(
      "MongoDB connected successfully ✅"
    );
  })
  .catch((error) => {
    console.error(
      "MongoDB connection failed ❌"
    );
    console.error(error.message);
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});