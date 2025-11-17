const redisClient = require("../config/redis");
const User = require("../models/user")  //! inlcude schema
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
        const token = jwt.sign({ _id: user._id, emailId: emailId, role: "user"}, process.env.JWT_KEY, { expiresIn: 3600 });
        res.cookie("token", token, { maxAge: 3600 * 1000 });     //! maxAge: lifetime of the cookie in milliseconds.

        res.status(201).send("User Registered Successfully");
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
        const token = jwt.sign({ _id: user._id, emailId: emailId, role: user.role}, process.env.JWT_KEY, { expiresIn: 3600 });
        res.cookie("token", token, { maxAge: 3600 * 1000 });

        res.status(200).send("Logged In Successfully");

    } catch (err) {
        res.status(401).send("Error: " + err);      // 401: unauthrised access
    }
}

const logout = async (req, res) => {
    try {
        // validate the token then blocklist that token untill the timeframe end(as token do not expire before time) & clear the cookies

        // since token is valid, extract it
        const {token} = req.cookies;
        const payload = jwt.decode(token);      // get payload using decode()

        // todo: add to redis to block this token
        await redisClient.set(`token:${token}`, "Blocked");
        await redisClient.expireAt(`token:${token}`, payload.exp)       // in payload expiry of token is present

        res.cookie("token", null, {expires: new Date(Date.now())});
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
        req.body.role = "admin";

        const user = await User.create(req.body);       //! hash password before creating user profile
        const token = jwt.sign({ _id: user._id, emailId: emailId, role: "user"}, process.env.JWT_KEY, { expiresIn: 3600 });
        res.cookie("token", token, { maxAge: 3600 * 1000 });     //! maxAge: lifetime of the cookie in milliseconds.

        res.status(201).send("User Registered Successfully");
    } catch (err) {
        res.status(400).send("Error: " + err);      // 400: Bad request -> invalid request syntax or parameter
    }
}

module.exports = { register, login, logout, adminRegister }