const express = require("express");

const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  deleteAccount,
  changePassword,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Get logged-in user
router.get("/me", protect, getMe);

// Update logged-in user profile
router.put("/profile", protect, updateProfile);

// Delete logged-in user account

router.delete("/profile", protect, deleteAccount);

// Change logged-in user's password
router.put("/change-password", protect, changePassword);

module.exports = router;