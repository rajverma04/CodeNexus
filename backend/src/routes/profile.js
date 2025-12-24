const express = require("express");
const router = express.Router();
const { getPublicProfile, setUsername, setBio } = require("../controllers/profileController");
const userMiddleware = require("../middleware/userMiddleware");

// Public profile by username
router.get("/:username", getPublicProfile);

// Protected updates
router.post("/username", userMiddleware, setUsername);
router.post("/bio", userMiddleware, setBio);

module.exports = router;
