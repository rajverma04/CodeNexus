const express = require("express");
const authRouter = express.Router();
const { register, login, logout, adminRegister, deleteProfile } = require("../controllers/userAuthenticate");
const userMiddleware = require("../middleware/userMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// register
authRouter.post("/register", register);     // second parameter is controller(or can say function)

// login
authRouter.post("/login", login);

// logout
authRouter.post("/logout", userMiddleware, logout);

// admin Register
authRouter.post("/admin/register", adminMiddleware, adminRegister);

// delete profile
authRouter.delete("/deleteProfile", userMiddleware, deleteProfile);

// getProfile
// authRouter.get("/getProgile", getProfile);

module.exports = authRouter;