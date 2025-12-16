const redisClient = require("../config/redis");
const User = require("../models/user")  //! inlcude schema
const Submission = require("../models/submission");
const validate = require("../utils/validator")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const verifyToken = require("./googleAuthenticate");



const register = async (req, res) => {
    try {
        // for registering required data must include as defined in Schema(firstName, email, password)


        // validate the data received from the user
        validate(req.body);        // send user data to validator to verify
        const { firstName, emailId, password } = req.body;

        req.body.password = await bcrypt.hash(password, 10);        // TODO: hashing password
        req.body.role = "user";

        const user = await User.create(req.body);       //! hash password before creating user profile
        const token = jwt.sign({ _id: user._id, emailId: emailId, role: "user" }, process.env.JWT_KEY, { expiresIn: 3600 });

        const reply = {
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role
        }


        res.cookie("token", token, { maxAge: 3600 * 1000, sameSite: 'none', secure: true });     //! maxAge: lifetime of the cookie in milliseconds.

        // res.status(201).send("User Registered Successfully");
        res.status(201).json({
            user: reply,
            message: "Registered Successfully"
        });
    } catch (err) {
        res.status(400).send("Error: " + err);      // 400: Bad request -> invalid request syntax or parameter
    }
}

const login = async (req, res) => {
    try {
        const { emailId, password } = req.body;
        if (!emailId) {
            throw new Error("Invalid Credential");
        }
        if (!password) {
            throw new Error("Invalid Credential");
        }

        const user = await User.findOne({ emailId });     // get user details from DB

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            throw new Error("Invalid Credential")
        }

        const reply = {     // only these data will be sent to frontend
            firstName: user.firstName,
            emailId: user.emailId,
            _id: user._id,
            role: user.role
        }
        const token = jwt.sign({ _id: user._id, emailId: emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: 3600 });
        res.cookie("token", token, { maxAge: 3600 * 1000, sameSite: 'none', secure: true });

        // res.status(200).send("Logged In Successfully");
        res.status(201).json({
            user: reply,
            message: "Login Successfully"
        });

    } catch (err) {
        res.status(401).send("Error: " + err);      // 401: unauthrised access
    }
}

const logout = async (req, res) => {
    try {
        // validate the token then blocklist that token untill the timeframe end(as token do not expire before time) & clear the cookies

        // since token is valid, extract it
        const { token } = req.cookies;
        const payload = jwt.decode(token);      // get payload using decode()

        // todo: add to redis to block this token
        await redisClient.set(`token:${token}`, "Blocked");
        await redisClient.expireAt(`token:${token}`, payload.exp)       // in payload expiry of token is present

        res.cookie("token", null, { expires: new Date(Date.now()), sameSite: 'none', secure: true });
        res.send("Logged Out Successfully");
    } catch (err) {
        res.status(503).send("Error: " + err);
    }
}

const adminRegister = async (req, res) => {
    try {

        validate(req.body);
        const { firstName, emailId, password } = req.body;

        req.body.password = await bcrypt.hash(password, 10);        // TODO: hashing password


        const user = await User.create(req.body);       //! hash password before creating user profile
        const token = jwt.sign({ _id: user._id, emailId: emailId, role: user.role }, process.env.JWT_KEY, { expiresIn: 3600 });
        res.cookie("token", token, { maxAge: 3600 * 1000, sameSite: 'none', secure: true });     //! maxAge: lifetime of the cookie in milliseconds.

        res.status(201).send("User Registered Successfully");
    } catch (err) {
        res.status(400).send("Error: " + err);      // 400: Bad request -> invalid request syntax or parameter
    }
}

const deleteProfile = async (req, res) => {
    try {
        const userId = req.result._id;      // getting id from userMiddleware

        // delete from userSchema
        await User.findByIdAndDelete(userId);       // it will post delete (see user Schema)

        // now delete submission code of this user from Database
        // await Submission.deleteMany({ userId });

        res.status(200).send("Deleted Successfully");

    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
}

const updateProfile = async (req, res) => {
    try {
        const userId = req.result._id;   // from auth middleware

        const { firstName, lastName, age } = req.body;

        // build update object dynamically
        const updateData = {};

        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (age) updateData.age = age;

        // if nothing to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                message: "Nothing to update"
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            {
                new: true,        // return updated document
                runValidators: true
            }
        ).select("firstName lastName emailId age role _id");

        res.status(200).json({
            user: updatedUser,
            message: "Profile updated successfully"
        });

    } catch (err) {
        res.status(500).json({
            message: "Error updating profile",
            error: err.message
        });
    }
};


const changePassword = async (req, res) => {
    try {
        const userId = req.result._id;

        const { oldPassword, newPassword } = req.body;
        console.log("Old: ", oldPassword)
        console.log("new: ", newPassword)
        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                message: "Old password and new password is required",
            })
        }

        const user = await User.findById(userId);
        console.log(user)
        if (!user) {
            return res.status(401).json({
                message: "User not found"
            })
        }

        // verify old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        console.log(isMatch)
        if (!isMatch) {
            return res.status(401).json({
                message: "Old password is incorrect"
            })
        }

        // store new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        await user.save();

        res.status(200).json({
            message: "Password Updated Successfully"
        })

    } catch (err) {
        res.status(500).json({
            message: "Error updating password",
            error: err.message
        });
    }


}


const googleSignIn = async (req, res) => {
    try {
        const { token } = req.body;
        const payload = await verifyToken(token);

        if (!payload) {
            return res.status(401).json({
                message: "Token verification failed"
            })
        }

        const email = payload.email;
        const firstName = payload.name;

        // check if user exists
        console.log("Checking user...");
        let user = await User.findOne({ emailId: email });
        // console.log("User found?", !!user);

        if (!user) {
            // console.log("Creating new user...");
            user = await User.create({
                firstName,
                emailId: email,
                authProvider: "google",
                password: null
            });
            // console.log("User created:", user._id);
        }

        // generate YOUR JWT
        const jwtToken = jwt.sign(
            { _id: user._id, emailId: user.emailId, role: user.role },
            process.env.JWT_KEY,
            { expiresIn: "1h" }
        );
        // console.log("User from DB", user);

        res.cookie("token", jwtToken, { maxAge: 3600 * 1000, sameSite: 'none', secure: true })

        res.status(200).json({
            message: "Google Sign-In successful",
            user: {
                _id: user._id,
                firstName: user.firstName,
                emailId: user.emailId,
                role: user.role,
            },
        });

    } catch (err) {
        console.error("Google Algo Error", err);
        res.status(401).json({
            message: "Invalid Google token",
            error: err.message,
        });
    }
};


module.exports = { register, login, logout, adminRegister, deleteProfile, updateProfile, changePassword, googleSignIn }