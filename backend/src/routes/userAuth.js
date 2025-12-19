const express = require("express");
const authRouter = express.Router();
const { register, login, logout, adminRegister, deleteProfile, updateProfile, changePassword, googleSignIn, verifyEmail, manageAccounts, sendVerificationOtp } = require("../controllers/userAuthenticate");
const userMiddleware = require("../middleware/userMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// register
authRouter.post("/register", register);     // second parameter is controller(or can say function)

// send otp
authRouter.post("/send-otp", userMiddleware, sendVerificationOtp);

// verify email
authRouter.post("/verify-email", verifyEmail);

// login
authRouter.post("/login", login);

// logout
authRouter.post("/logout", userMiddleware, logout);

// admin Register
authRouter.post("/admin/register", adminMiddleware, adminRegister);

// delete profile
authRouter.delete("/deleteProfile", userMiddleware, deleteProfile);

// update profile
authRouter.put("/update", userMiddleware, updateProfile);

// change password
authRouter.post("/changepassword", userMiddleware, changePassword);

// google signIn/signUp
authRouter.post("/google-signin", googleSignIn);

// get all users
authRouter.get("/getAllUsers", adminMiddleware, manageAccounts);



authRouter.get("/check", userMiddleware, (req, res) => {
    const reply = {
        firstName: req.result.firstName,
        lastName: req.result.lastName,
        emailId: req.result.emailId,
        age: req.result.age,
        _id: req.result._id,
        role: req.result.role,
        problemSolved: req.result.problemSolved,
        isEmailVerified: req.result.isEmailVerified,
        hasPassword: !!req.result.password
    }

    res.status(200).json({
        user: reply,
        message: "Valid User"
    })
})
// getProfile
// authRouter.get("/getProgile", getProfile);

module.exports = authRouter;