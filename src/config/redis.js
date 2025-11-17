const { createClient } = require('redis');
require("dotenv").config();

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

module.exports = redisClient;