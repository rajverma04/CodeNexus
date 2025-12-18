const mongoose = require("mongoose");
const { Schema } = mongoose;

// this is pre Schema
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
        required: function () {
            return this.authProvider !== "google";
        }
    },
    role: {
        type: String,
        enum: ["admin", "user"],        // only these value will be set
        default: "user"
    },
    problemSolved: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: "problem"
        }],
        default: []
    },

    // authentication provider
    authProvider: {
        type: String,
        enum: ["local", "google"],
        default: "local"
    },

    // email verification
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String,
    },
    emailVerificationExpireAt: {
        type: Date,
    }

}, { timestamps: true });

// it will run post(after the findOneByIDAndDelete) in the last to delete everyting related this to this userId
userSchema.post("findOneAndDelete", async function (userInfo) {
    if (userInfo) {
        await mongoose.model("submission").deleteMany({ userId: userInfo._id });
    }
})

const User = mongoose.model("user", userSchema);

module.exports = User;