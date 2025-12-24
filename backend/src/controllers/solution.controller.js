const UserSolution = require("../models/userSolution");
const mongoose = require("mongoose");

// Create Solution
const createSolution = async (req, res) => {
    try {
        const { problemId } = req.params;
        const { title, description, language, code, tags } = req.body;
        const userId = req.result._id;

        const solution = new UserSolution({
            problemId,
            userId,
            title,
            description,
            language,
            code,
            tags
        });

        await solution.save();

        await solution.populate("userId", "username profilePicture");

        res.status(201).json({ success: true, solution });

    } catch (error) {
        console.error("Error creating solution:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get Solutions for Problem
const getSolutions = async (req, res) => {
    try {
        const { problemId } = req.params;
        const { sortBy = "newest", page = 1, limit = 10 } = req.query;

        const skip = (page - 1) * limit;

        // Basic finding
        // Note: For complex sorting like "most upvoted", aggregation is better, 
        // but for MVP we can use a virtual or just sort by array size if schema allows, 
        // or just fetch and sort (bad for scale).
        // Since we are not storing a count field, sorting by array length in standard find is hard in Mongo.
        // Let's use aggregation.

        let pipeline = [
            { $match: { problemId: new mongoose.Types.ObjectId(problemId) } },
            {
                $addFields: {
                    upvoteCount: { $size: { $ifNull: ["$upvotes", []] } }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            // Project necessary fields
            {
                $project: {
                    title: 1,
                    description: 1, // Maybe truncate for list?
                    language: 1,
                    code: 1, // Usually don't need full code in list, but ok for now
                    tags: 1,
                    createdAt: 1,
                    upvotes: 1,
                    comments: 1, // Or just count
                    upvoteCount: 1,
                    "user._id": 1,
                    "user.username": 1,
                    "user.profilePicture": 1
                }
            }
        ];

        if (sortBy === "mostUpvoted") {
            pipeline.push({ $sort: { upvoteCount: -1, createdAt: -1 } });
        } else {
            pipeline.push({ $sort: { createdAt: -1 } });
        }

        pipeline.push({ $skip: parseInt(skip) });
        pipeline.push({ $limit: parseInt(limit) });

        const solutions = await UserSolution.aggregate(pipeline);

        // Count total for pagination
        const total = await UserSolution.countDocuments({ problemId });

        res.status(200).json({
            success: true,
            solutions,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        });

    } catch (error) {
        console.error("Error fetching solutions:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get Solution By ID
const getSolutionById = async (req, res) => {
    try {
        const { solutionId } = req.params;

        const solution = await UserSolution.findById(solutionId)
            .populate("userId", "username profilePicture")
            .populate("comments.userId", "username profilePicture");

        if (!solution) {
            return res.status(404).json({ success: false, message: "Solution not found" });
        }

        res.status(200).json({ success: true, solution });
    } catch (error) {
        console.error("Error fetching solution:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

// Vote Solution
const voteSolution = async (req, res) => {
    try {
        const { solutionId } = req.params;
        const userId = req.result._id;

        const solution = await UserSolution.findById(solutionId);
        if (!solution) {
            return res.status(404).json({ success: false, message: "Solution not found" });
        }

        if (!solution.upvotes) solution.upvotes = [];

        const index = solution.upvotes.indexOf(userId);
        if (index === -1) {
            solution.upvotes.push(userId);
        } else {
            solution.upvotes.splice(index, 1);
        }

        await solution.save();

        res.status(200).json({ success: true, upvotes: solution.upvotes });

    } catch (error) {
        console.error("Error voting solution:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Add Comment
const addComment = async (req, res) => {
    try {
        const { solutionId } = req.params;
        const { text } = req.body;
        const userId = req.result._id;

        if (!text) {
            return res.status(400).json({ success: false, message: "Text required" });
        }

        const solution = await UserSolution.findById(solutionId);
        if (!solution) {
            return res.status(404).json({ success: false, message: "Solution not found" });
        }

        solution.comments.push({ userId, text });
        await solution.save();

        // Populate the last comment's user
        await solution.populate("comments.userId", "username profilePicture");
        const newComment = solution.comments[solution.comments.length - 1];

        res.status(201).json({ success: true, comment: newComment });

    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Delete Solution
const deleteSolution = async (req, res) => {
    try {
        const { solutionId } = req.params;
        const userId = req.result._id;

        const solution = await UserSolution.findById(solutionId);
        if (!solution) {
            return res.status(404).json({ success: false, message: "Solution not found" });
        }

        if (solution.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        await UserSolution.findByIdAndDelete(solutionId);

        res.status(200).json({ success: true, message: "Deleted successfully" });

    } catch (error) {
        console.error("Error deleting solution:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


module.exports = {
    createSolution,
    getSolutions,
    getSolutionById,
    voteSolution,
    addComment,
    deleteSolution
};
