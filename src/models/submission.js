const mongoose = require("mongoose");
const { Schema } = mongoose;

const submissionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    problemId: {
        type: Schema.Types.ObjectId,
        ref: "Problem",
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    language: {
        type: String,
        required: true,
        enum: ["cpp", "java", "javascript"]
    },
    status: {
        type: String,
        required: true,
        enum: ["pending", "accepted", "wrong", "error"],
        dafault: "pending"
    },
    runtime: {
        type: Number,       // miliseconds
        default: 0,
    },
    memory: {
        type: Number,       // in kB
        default: 0
    },
    errorMessage: {
        type: String,
        default: '',
    },
    testCasesPassed: {
        type: Number,
        default: 0
    },
    testCasesTotal: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

const Submission = mongoose.model("submission", submissionSchema);

module.exports = Submission;