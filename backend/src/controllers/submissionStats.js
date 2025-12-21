const Submission = require("../models/submission");
const mongoose = require("mongoose");

const getSubmissionStats = async (req, res) => {
    try {
        const userId = req.user._id;

        // Calculate date one year ago
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const stats = await Submission.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    createdAt: { $gte: oneYearAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    count: 1
                }
            },
            {
                $sort: { date: 1 }
            }
        ]);

        return res.status(200).json(stats);
    } catch (error) {
        console.error("Error fetching submission stats:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    getSubmissionStats
};
