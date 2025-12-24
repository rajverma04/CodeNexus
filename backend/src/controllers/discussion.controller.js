const Discussion = require("../models/discussion");
const User = require("../models/user");
const mongoose = require("mongoose");

// Create a new discussion (top-level)
const createDiscussion = async (req, res) => {
    try {
        const { problemId } = req.params;
        const { title, content } = req.body;
        const userId = req.result._id;

        if (!title || !content) {
            return res.status(400).json({ success: false, message: "Title and content are required" });
        }

        const discussion = new Discussion({
            problemId,
            userId,
            title,
            content
        });

        await discussion.save();

        // Populate user details for immediate display
        await discussion.populate("userId", "username profilePicture");

        res.status(201).json({ success: true, discussion });
    } catch (error) {
        console.error("Error creating discussion:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get discussions for a problem
const getDiscussions = async (req, res) => {
    try {
        const { problemId } = req.params;
        const { sortBy = "newest", page = 1, limit = 10 } = req.query;
        console.log("Fetching discussions for:", problemId, "Sort:", sortBy, "Page:", page);

        const skip = (page - 1) * limit;

        let sortOption = {};
        if (sortBy === "newest") {
            sortOption = { createdAt: -1 };
        } else if (sortBy === "oldest") {
            sortOption = { createdAt: 1 };
        } else if (sortBy === "mostLiked") {
            // Sorting by array length is tricky in Mongo simple queries, 
            // doing a simple sort here. For true 'most voted' robustly we might need aggregation.
            // For MVP, we'll sort by createdAt and let frontend sort or complex aggregation later.
            // Actually, we can use aggregation to project size then sort.
            // Let's stick to simple newest/oldest for MVP, or handle mostLiked by basic heuristic later effectively
            // But let's try to implement aggregation for mostLiked if requested.
        }

        // Using aggregation for better flexibility
        let pipeline = [
            { $match: { problemId: new mongoose.Types.ObjectId(problemId), parentDiscussionId: null } },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $lookup: {
                    from: "discussions",
                    localField: "replies",
                    foreignField: "_id",
                    as: "replyDocs"
                }
            },
            // Lookup user for each reply
            {
                $lookup: {
                    from: "users",
                    localField: "replyDocs.userId",
                    foreignField: "_id",
                    as: "replyUsers"
                }
            },
            // Project necessary fields to avoid sending passwords etc.
            {
                $project: {
                    title: 1,
                    content: 1,
                    createdAt: 1,
                    upvotes: 1,
                    downvotes: 1,
                    "user._id": 1,
                    "user.username": 1,
                    "user.profilePicture": 1,
                    replyCount: { $size: "$replies" },
                    // We will fetch full replies optionally or just counts. 
                    // For the list, let's just send the discussion. 
                    // Or if we want to include replies (since nesting is 1 level)
                    replies: 1 // Sending IDs is okay, or we can populate deeply.
                }
            },
            {
                $addFields: {
                    upvoteCount: { $size: { $ifNull: ["$upvotes", []] } }
                }
            }
        ];

        if (sortBy === "mostLiked") {
            pipeline.push({ $sort: { upvoteCount: -1, createdAt: -1 } });
        } else if (sortBy === "oldest") {
            pipeline.push({ $sort: { createdAt: 1 } });
        } else {
            pipeline.push({ $sort: { createdAt: -1 } });
        }

        pipeline.push({ $skip: parseInt(skip) });
        pipeline.push({ $limit: parseInt(limit) });

        // NOTE: Mongoose aggregate returns plain objects
        // However, to keep it consistent with normal find, we might want to manually populate replies
        // Let's switch to standard .find() for simplicity unless performance demands aggregation now
        // Standard find is easier to maintain for "Populating deep replies"

        let query = Discussion.find({ problemId, parentDiscussionId: null })
            .populate("userId", "username profilePicture")
            .populate({
                path: "replies",
                populate: { path: "userId", select: "username profilePicture" }
            });

        if (sortBy === "newest") {
            query = query.sort({ createdAt: -1 });
        } else if (sortBy === "oldest") {
            query = query.sort({ createdAt: 1 });
        }
        // Note: mostLiked via find() is hard without virtuals. Skipping strict 'mostLiked' sort in DB layer for MVP simpler approach
        // or doing in-memory sort if data set is small (but bad for scaling).
        // Let's stick to basic sorting for now.

        const discussions = await query.skip(skip).limit(parseInt(limit));

        // If mostLiked is requested and we can't easily DB sort, we could do it here but pagination breaks.
        // We will assume 'newest' is default and primary.

        const total = await Discussion.countDocuments({ problemId, parentDiscussionId: null });

        res.json({
            success: true,
            discussions,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        });

    } catch (error) {
        console.error("Error fetching discussions FULL:", error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: "Invalid Problem ID" });
        }
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Add a reply
const addReply = async (req, res) => {
    try {
        const { discussionId } = req.params; // Parent discussion ID
        const { content } = req.body;
        const userId = req.result._id;

        if (!content) {
            return res.status(400).json({ success: false, message: "Content is required" });
        }

        const parentDiscussion = await Discussion.findById(discussionId);
        if (!parentDiscussion) {
            return res.status(404).json({ success: false, message: "Discussion not found" });
        }

        const reply = new Discussion({
            problemId: parentDiscussion.problemId,
            userId,
            parentDiscussionId: discussionId,
            content
        });

        await reply.save();

        // Add reply to parent
        parentDiscussion.replies.push(reply._id);
        await parentDiscussion.save();

        await reply.populate("userId", "username profilePicture");

        res.status(201).json({ success: true, reply });

    } catch (error) {
        console.error("Error adding reply:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Vote (Like/Dislike)
const voteDiscussion = async (req, res) => {
    try {
        const { discussionId } = req.params;
        const { type } = req.body; // 'like' or 'dislike'
        const userId = req.result._id;

        const discussion = await Discussion.findById(discussionId);
        if (!discussion) {
            return res.status(404).json({ success: false, message: "Discussion not found" });
        }

        // Initialize arrays if they don't exist
        if (!discussion.upvotes) discussion.upvotes = [];
        if (!discussion.downvotes) discussion.downvotes = [];

        const alreadyLiked = discussion.upvotes.includes(userId);
        const alreadyDisliked = discussion.downvotes.includes(userId);

        if (type === "like") {
            if (alreadyLiked) {
                // Remove like
                discussion.upvotes.pull(userId);
            } else {
                // Remove dislike if exists
                if (alreadyDisliked) discussion.downvotes.pull(userId);
                // Add like
                discussion.upvotes.push(userId);
            }
        } else if (type === "dislike") {
            if (alreadyDisliked) {
                // Remove dislike
                discussion.downvotes.pull(userId);
            } else {
                // Remove like if exists
                if (alreadyLiked) discussion.upvotes.pull(userId);
                // Add dislike
                discussion.downvotes.push(userId);
            }
        }

        await discussion.save();

        res.json({
            success: true,
            upvotes: discussion.upvotes,
            downvotes: discussion.downvotes
        });

    } catch (error) {
        console.error("Error voting:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Delete discussion
const deleteDiscussion = async (req, res) => {
    try {
        const { discussionId } = req.params;
        const userId = req.result._id;

        const discussion = await Discussion.findById(discussionId);
        if (!discussion) {
            return res.status(404).json({ success: false, message: "Discussion not found" });
        }

        // Check ownership
        if (discussion.userId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to delete this discussion" });
        }

        // If it's a reply, remove from parent
        if (discussion.parentDiscussionId) {
            await Discussion.findByIdAndUpdate(discussion.parentDiscussionId, {
                $pull: { replies: discussionId }
            });
        } else {
            // If it's a parent, delete all replies
            await Discussion.deleteMany({ parentDiscussionId: discussionId });
        }

        await Discussion.findByIdAndDelete(discussionId);

        res.json({ success: true, message: "Discussion deleted" });

    } catch (error) {
        console.error("Error deleting discussion:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = {
    createDiscussion,
    getDiscussions,
    addReply,
    voteDiscussion,
    deleteDiscussion
};
