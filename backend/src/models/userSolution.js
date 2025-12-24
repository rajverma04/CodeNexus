const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSolutionSchema = new Schema({
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
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100
    },
    description: {
        type: String, // Markdown explanation
        required: true
    },
    language: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    tags: [{
        type: String
    }],
    upvotes: [{
        type: Schema.Types.ObjectId,
        ref: "user"
    }],
    comments: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        text: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

// Index for efficient fetching by problem and sorting
userSolutionSchema.index({ problemId: 1, createdAt: -1 });

const UserSolution = mongoose.model("userSolution", userSolutionSchema);

module.exports = UserSolution;
