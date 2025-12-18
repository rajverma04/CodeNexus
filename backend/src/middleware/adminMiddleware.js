const jwt = require("jsonwebtoken");
const User = require("../models/user");
const redisClient = require("../config/redis");
require("dotenv").config();

const adminMiddleware = async (req, res, next) => {
    try {

        const { token } = req.cookies;    // get cookie from frontend
        if (!token) {
            throw new Error("Token is not present");
        }

        const payload = jwt.verify(token, process.env.JWT_KEY);     // verify the token first(it return payload)

        const { _id } = payload;
        if (!_id) {
            throw new Error("Invalid token");
        }

        const result = await User.findOne({ _id });

        if (payload.role != "admin") {          //! admin validation
            throw new Error("Invalid Token");
        }

        if (!result) {
            throw new Error("User Doesn't Exist");
        }

        // now check is user present in redis blocklist or not
        // const isBlocked = await redisClient.exists(`token:${token}`);
        // if (isBlocked) {
        //     throw new Error("Invalid Token");
        // }

        req.result = result;
        // console.log("Admin middleware passing");
        next();

    } catch (err) {
        res.status(401).send("Error:" + err);
    }
}

module.exports = adminMiddleware;

