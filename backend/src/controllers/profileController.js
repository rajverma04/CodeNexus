const User = require("../models/user");
const Submission = require("../models/submission");
const Problem = require("../models/problems");

// Public: GET /profile/:username
async function getPublicProfile(req, res) {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select("_id firstName lastName username role createdAt bio");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Aggregate solved problems (distinct accepted problems)
    const acceptedAgg = await Submission.aggregate([
      { $match: { userId: user._id, status: "accepted" } },
      { $group: { _id: "$problemId" } },
    ]);
    const solvedProblemIds = acceptedAgg.map((d) => d._id);

    // Difficulty counts
    let difficultyCounts = { easy: 0, medium: 0, hard: 0 };
    if (solvedProblemIds.length) {
      const problems = await Problem.find({ _id: { $in: solvedProblemIds } }).select("difficulty");
      for (const p of problems) {
        if (p.difficulty && difficultyCounts[p.difficulty] !== undefined) {
          difficultyCounts[p.difficulty] += 1;
        }
      }
    }

    // Submission stats
    const [totalSubmissions, acceptedSubmissions] = await Promise.all([
      Submission.countDocuments({ userId: user._id }),
      Submission.countDocuments({ userId: user._id, status: "accepted" }),
    ]);
    const successRate = totalSubmissions ? Number(((acceptedSubmissions / totalSubmissions) * 100).toFixed(2)) : 0;

    // Global rank: rank by solved count (distinct accepted problems)
    const solvedByUserAgg = await Submission.aggregate([
      { $match: { status: "accepted" } },
      { $group: { _id: { userId: "$userId", problemId: "$problemId" } } },
      { $group: { _id: "$_id.userId", solvedDistinct: { $sum: 1 } } },
    ]);
    const currentSolved = solvedProblemIds.length;
    const greaterCount = solvedByUserAgg.filter((u) => u.solvedDistinct > currentSolved).length;
    const totalUsersRanked = solvedByUserAgg.length || 1;
    const globalRank = currentSolved === 0 ? null : greaterCount + 1;

    // Recent submissions
    const recent = await Submission.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("problemId status runtime memory createdAt");

    res.status(200).json({
      success: true,
      profile: {
        user: {
          id: user._id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          bio: user.bio || "",
          joinedAt: user.createdAt,
        },
        stats: {
          solvedCount: solvedProblemIds.length,
          totalSubmissions,
          acceptedSubmissions,
          successRate,
          difficultyCounts,
          globalRank,
          totalUsersRanked,
        },
        recent,
      },
    });
  } catch (err) {
    console.error("getPublicProfile error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// Protected: POST /profile/username  { username }
async function setUsername(req, res) {
  try {
    const userId = req.result._id;
    let { username } = req.body || {};
    if (!username || typeof username !== "string") {
      return res.status(400).json({ success: false, message: "Username required" });
    }
    username = username.trim().toLowerCase();
    const regex = /^[a-z0-9_.-]{3,20}$/;
    if (!regex.test(username)) {
      return res.status(400).json({ success: false, message: "Invalid username format" });
    }

    const exists = await User.findOne({ username });
    if (exists && String(exists._id) !== String(userId)) {
      return res.status(409).json({ success: false, message: "Username already taken" });
    }

    const updated = await User.findByIdAndUpdate(userId, { $set: { username } }, { new: true });
    res.status(200).json({ success: true, username: updated.username });
  } catch (err) {
    console.error("setUsername error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// Protected: POST /profile/bio  { bio }
async function setBio(req, res) {
  try {
    const userId = req.result._id;
    let { bio = "" } = req.body || {};
    bio = String(bio).slice(0, 280);
    const updated = await User.findByIdAndUpdate(userId, { $set: { bio } }, { new: true });
    res.status(200).json({ success: true, bio: updated.bio || "" });
  } catch (err) {
    console.error("setBio error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// Public: GET /profile/check-username?username=foo
async function checkUsername(req, res) {
  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ success: false, message: "Username required" });
    const exists = await User.findOne({ username: String(username).trim().toLowerCase() }).select("_id");
    res.status(200).json({ success: true, available: !exists });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { getPublicProfile, setUsername, setBio, checkUsername };
