const mongoose = require("mongoose");
const { Schema } = mongoose;

const videoSchema = new Schema({
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
    cloudinaryPublicId: {
        type: String,
        required: true
    },
    secureURL: {
        type: String,
        required: true
    },
    thumbnailURL: {
        type: String
    },
    duration: {
        type: Number,
        required: true
    },
}, { timestamps: true });

const SolutionVideo = mongoose.model("solutionVideo", videoSchema);

module.exports = SolutionVideo;