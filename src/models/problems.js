const mongoose = require("mongoose");
const { Schema } = mongoose;

const problemSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"]
    },
    tags: {
        type: String,
        required: true,
        enum: ["array", "linkedlist", "stack", "queue", "graph", "tree", "dp"]
    },
    visibleTestCases: [
        {
            input: {
                type: String,
                required: true
            },
            output: {
                type: String,
                required: true
            },
            explanation: {
                type: String,
                required: true
            }
        }

    ],
    hiddenTestCases: [
        {
            input: {
                type: String,
                required: true
            },
            output: {
                type: String,
                required: true
            }
        }

    ],
    startCode: [
        {
            language: {
                type: String,
                required: true
            },
            initialCode: {
                type: String,
                required: true
            }
        }
    ],
    problemCreator: {       // who created the problem
        type: Schema.Types.ObjectId,     // problem creator id
        ref: "user",        // refer to user schema(user.js)
        required: true
    },
    referenceSolution: [    // actual solution of problem
        {
            language: {
                type: String,
                required: true
            },
            completeCode: {
                type: String,
                required: true
            }
        }
    ]
}, { timestamps: true })

const Problem = mongoose.model("problem", problemSchema);

module.exports = Problem;
