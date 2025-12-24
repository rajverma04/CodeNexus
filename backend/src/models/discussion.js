const mongoose = require("mongoose");
const { Schema } = mongoose;

const discussionSchema = new Schema({
    problemId: {
        type: Schema.Types.ObjectId,
        ref: "problem",
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    parentDiscussionId: {
        type: Schema.Types.ObjectId,
        ref: "discussion",
        default: null
    },
    title: {
        type: String,
        // Only top-level discussions need a title
        required: function () { return !this.parentDiscussionId; }
    },
    content: {
        type: String,
        required: true
    },
    upvotes: [{
        type: Schema.Types.ObjectId,
        ref: "user"
    }],
    downvotes: [{
        type: Schema.Types.ObjectId,
        ref: "user"
    }],
    replies: [{
        type: Schema.Types.ObjectId,
        ref: "discussion"
    }]
}, { timestamps: true });

// Optimize queries
discussionSchema.index({ problemId: 1, createdAt: -1 });

const Discussion = mongoose.model("discussion", discussionSchema);

module.exports = Discussion;
