const express = require("express");
const router = express.Router();
const userMiddleware = require("../middleware/userMiddleware");
const {
    createDiscussion,
    getDiscussions,
    addReply,
    voteDiscussion,
    deleteDiscussion
} = require("../controllers/discussion.controller");

// Apply middleware to protect routes
// Note: verify if getDiscussions should be public or private. 
// Requirement says "Only authenticated users can...". Assuming reading is allowed? 
// The prompt says "Only authenticated users can: Create..., Post..., Like..., Reply...".
// It doesn't explicitly forbid reading. But "Integrate APIs using existing auth flow" implies protection.
// Let's assume reading is public (so users can see discussions before logging in) OR private.
// For now, making it public to view, private to act.
// Wait, prompt says "Only authenticated users can... Create...". Usually viewing is open.
// But to be safe with "Integrate APIs using existing auth flow", let's keep GET public or optional auth if needed for "my like status".
// If we want "my like status" in the list, we need the user ID.
// Let's make GET public but if token exists we use it? Or just make it protected for simplicity for now as per "Protect all routes using JWT middleware" requirement (maybe applies to mutations?)
// Actually "Protect all routes using JWT middleware" is listed under Backend Requirements. so I will protect ALL.

router.post("/:problemId", userMiddleware, createDiscussion);
router.get("/:problemId", userMiddleware, getDiscussions); // Protected as per strict requirement
router.post("/reply/:discussionId", userMiddleware, addReply);
router.put("/vote/:discussionId", userMiddleware, voteDiscussion);
router.delete("/:discussionId", userMiddleware, deleteDiscussion);

module.exports = router;
