const { Queue } = require("bullmq");
require("dotenv").config();

const connection = {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PD,
    username: 'default'
};

const submissionQueue = new Queue("submission-queue", {
    connection
});

module.exports = submissionQueue;
