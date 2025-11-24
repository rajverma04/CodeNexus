const mongoose = require("mongoose");
const {Schema} = mongoose;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 20
    },
    lastName: {
        type: String,
        minLength: 3,
        maxLength: 20
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        immutable: true,
    },
    age: {
        type: Number,
        min: 6,
        max: 80
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["admin", "user"],        // only these value will be set
        default: "user"
    },
    problemSolved: {
        type: [{
            type: Schema.Types.ObjectId,        // unique solved stored
            ref: "problem"
        }],
        unique: true
    }
}, {timestamps: true});


const User = mongoose.model("user", userSchema);

module.exports = User;