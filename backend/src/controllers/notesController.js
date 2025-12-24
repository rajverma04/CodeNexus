const Note = require("../models/note");
const Problem = require("../models/problems");

// List all notes for current user, include problem title & description
async function listNotes(req, res) {
  try {
    const userId = req.result._id;
    const notes = await Note.find({ user: userId })
      .populate({ path: "problem", select: "title description" })
      .sort({ updatedAt: -1 });

    const data = notes.map((n) => ({
      problemId: n.problem?._id?.toString(),
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

    // Validate problem exists
    const problem = await Problem.findById(problemId).select("_id");
    if (!problem) {
      return res.status(404).json({ success: false, message: "Problem not found" });
    }

    const note = await Note.findOneAndUpdate(
      { user: userId, problem: problemId },
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
    await Note.findOneAndDelete({ user: userId, problem: problemId });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { listNotes, getNote, upsertNote, deleteNote };
