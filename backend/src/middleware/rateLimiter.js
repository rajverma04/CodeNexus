const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const redisClient = require("../config/redis")

const loginRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,       // 15 min
    max: 5,
    standardHeaders: true,

    // Store in Redis so all cluster nodes / serverless instances share the IP limit
    store: new RedisStore({
        sendCommand: async (...args) => {
            if (!redisClient.isOpen) {
                await redisClient.connect();
            }

            return redisClient.sendCommand(args)
        }
    }),

    message: {
        success: false,
        message: "Too many login attempts. Please try again after 15 minutes"
    }

})

module.exports = loginRateLimit;