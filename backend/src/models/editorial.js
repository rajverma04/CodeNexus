const mongoose = require("mongoose");
const { Schema } = mongoose;

const editorialSchema = new Schema({
    problemId: {
        type: Schema.Types.ObjectId,
        ref: "problem",
        required: true,
        unique: true // One editorial per problem
    },
    content: {
        type: String, // Markdown content for explanation
        required: true
    },
    code: [{
        language: {
            type: String,
            required: true
        },
        code: {
            type: String,
            required: true
        }
    }],
    tags: [{
        type: String
    }],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "user" // Admin who created it
    }
}, { timestamps: true });

const Editorial = mongoose.model("editorial", editorialSchema);

module.exports = Editorial;
