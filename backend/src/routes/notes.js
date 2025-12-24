const express = require("express");
const router = express.Router();
const userMiddleware = require("../middleware/userMiddleware");
const { listNotes, getNote, upsertNote, deleteNote } = require("../controllers/notesController");

// Protected routes
router.use(userMiddleware);

// List all notes
router.get("/", listNotes);

// Get note for a problem
router.get("/:problemId", getNote);

// Create/update note for a problem
router.post("/:problemId", upsertNote);

// Delete note for a problem
router.delete("/:problemId", deleteNote);

module.exports = router;
