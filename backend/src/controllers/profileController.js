const User = require("../models/user");
const Submission = require("../models/submission");
const Problem = require("../models/problems");

// Public: GET /profile/:username
async function getPublicProfile(req, res) {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select("_id firstName lastName username emailId role createdAt bio isEmailVerified");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Aggregate solved problems (distinct accepted problems) for this user
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

    // Global rank (MongoDB 5+): compute rank over distinct accepted counts using window functions
    // Score per user = number of distinct accepted problems (solvedDistinct)
    const currentSolved = solvedProblemIds.length;

    // Total users with at least 1 solved
    const totalRankedRes = await Submission.aggregate([
      { $match: { status: "accepted" } },
      { $group: { _id: { userId: "$userId", problemId: "$problemId" } } },
      { $group: { _id: "$_id.userId" } },
      { $count: "count" },
    ]);
    const totalUsersRanked = totalRankedRes?.[0]?.count || 0;

    let globalRank = null;
    if (currentSolved > 0) {
      // Compute distinct solved counts for all users, then rank deterministically in memory
      const solvedPerUser = await Submission.aggregate([
        { $match: { status: "accepted" } },
        { $group: { _id: { userId: "$userId", problemId: "$problemId" } } },
        { $group: { _id: "$_id.userId", solvedDistinct: { $sum: 1 } } },
      ]);

      solvedPerUser.sort((a, b) => {
        if (b.solvedDistinct !== a.solvedDistinct) {
          return b.solvedDistinct - a.solvedDistinct;
        }
        // Stable tie-breaker by ObjectId string to avoid rank flapping
        return String(a._id).localeCompare(String(b._id));
      });

      const position = solvedPerUser.findIndex((u) => String(u._id) === String(user._id));
      if (position !== -1) {
        globalRank = position + 1; // 1-based rank
      }
    }

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
          emailId: user.emailId,
          bio: user.bio || "",
          isEmailVerified: user.isEmailVerified,
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

// Public: GET /profile/:username/activity (no auth) - last year submission counts by date
async function getPublicActivity(req, res) {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select("_id");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const stats = await Submission.aggregate([
      { $match: { userId: user._id, createdAt: { $gte: oneYearAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $project: { _id: 0, date: "$_id", count: 1 } },
      { $sort: { date: 1 } },
    ]);

    res.status(200).json({ success: true, activity: stats });
  } catch (err) {
    console.error("getPublicActivity error:", err);
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

module.exports = { getPublicProfile, getPublicActivity, setUsername, setBio, checkUsername };
