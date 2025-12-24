const express = require("express");
const router = express.Router();
const { getPublicProfile, getPublicActivity, setUsername, setBio, checkUsername } = require("../controllers/profileController");
const userMiddleware = require("../middleware/userMiddleware");

// Public routes (order matters: specific before param)
router.get("/check-username/availability", checkUsername);
router.get("/:username/activity", getPublicActivity);
router.get("/:username", getPublicProfile);

// Protected updates
router.post("/username", userMiddleware, setUsername);
router.post("/bio", userMiddleware, setBio);

module.exports = router;
