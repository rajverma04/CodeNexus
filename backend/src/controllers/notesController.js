const Note = require("../models/note");
const Problem = require("../models/problems");

// List all notes for current user, include problem title & description
async function listNotes(req, res) {
  try {
    const userId = req.result._id;
    const notes = await Note.find({ user: userId })
      .populate({ path: "problem", select: "title description", strictPopulate: false })
      .sort({ updatedAt: -1 });

    const data = notes.map((n) => ({
      problemId: n.problem?._id?.toString() || n.problem.toString(),
      title: n.problem?.title || "Untitled",
      description: n.problem?.description || "",
      content: n.content || "",
      updatedAt: n.updatedAt,
    }));

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// Get note for a specific problem
async function getNote(req, res) {
  try {
    const userId = req.result._id;
    const { problemId } = req.params;

    const note = await Note.findOne({ user: userId, problem: problemId });
    res.status(200).json({ success: true, content: note?.content || "" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// Create or update note content for a problem
async function upsertNote(req, res) {
  try {
    const userId = req.result._id;
    const { problemId } = req.params;
    const { content = "" } = req.body || {};

    // Check if problem exists, but don't fail if it doesn't (user might have local drafts)
    const problem = await Problem.findById(problemId).select("_id");
    // If problem doesn't exist, we still save the note with the problemId reference
    // Mongoose will store it as-is; it won't fail
    
    const mongoose = require("mongoose");
    const problemObjectId = new mongoose.Types.ObjectId(problemId);

    const note = await Note.findOneAndUpdate(
      { user: userId, problem: problemObjectId },
      { $set: { content } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true, content: note.content });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// Delete note for a problem
async function deleteNote(req, res) {
  try {
    const userId = req.result._id;
    const { problemId } = req.params;
    const mongoose = require("mongoose");
    
    console.log(`[DELETE] Attempting to delete note: userId=${userId}, problemId=${problemId}`);
    
    // Try matching as ObjectId first
    let deleted;
    try {
      const problemObjectId = new mongoose.Types.ObjectId(problemId);
      console.log(`[DELETE] Trying ObjectId query with: ${problemObjectId}`);
      deleted = await Note.findOneAndDelete({ user: userId, problem: problemObjectId });
    } catch (e) {
      console.log(`[DELETE] ObjectId conversion failed, trying string query`);
      // If ObjectId conversion fails, try matching as string
      deleted = await Note.findOneAndDelete({ user: userId, problem: problemId });
    }
    
    // If still not found, try _id matching as fallback
    if (!deleted) {
      console.log(`[DELETE] ObjectId query failed, trying _id query`);
      deleted = await Note.findOneAndDelete({ user: userId, _id: problemId });
    }
    
    if (!deleted) {
      console.warn(`[DELETE] Note not found: user=${userId}, problemId=${problemId}`);
      // Log all notes for this user to debug
      const allNotes = await Note.find({ user: userId }).select("_id problem");
      console.log(`[DELETE] User's notes:`, allNotes);
      return res.status(404).json({ success: false, message: "Note not found" });
    }
    
    console.log(`[DELETE] ✓ Successfully deleted note`);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(`[DELETE] Error:`, err.message);
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { listNotes, getNote, upsertNote, deleteNote };
