const redisClient = require("../config/redis");
const User = require("../models/user")  //! inlcude schema
const Submission = require("../models/submission");
const validate = require("../utils/validator")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")


const register = async (req, res) => {
    try {
        // for registering required data must include as defined in Schema(firstName, email, password)


        // validate the data received from the user
        validate(req.body);        // send user data to validator to verify
        const { fristName, emailId, password } = req.body;

        req.body.password = await bcrypt.hash(password, 10);        // TODO: hashing password
        req.body.role = "user";

        const user = await User.create(req.body);       //! hash password before creating user profile
        const token = jwt.sign({ _id: user._id, emailId: emailId, role: "user" }, process.env.JWT_KEY, { expiresIn: 3600 });

        const reply = {
            fristName: user.firstName,
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
            fristName: user.firstName,
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
        const { fristName, emailId, password } = req.body;

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
module.exports = { register, login, logout, adminRegister, deleteProfile }