const { Worker } = require("bullmq");
const redisClient = require("../config/redis");
const Submission = require("../models/submission");
const User = require("../models/user");
const Problem = require("../models/problems");
const { getLanguageById, submitBatch, submitToken } = require("../utils/problemUtility");

const connection = {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PD,
    username: 'default'
};

const submissionWorker = new Worker(
    "submission-queue",
    async (job) => {
        const { submissionId, userId, problemId, code, language } = job.data;
        console.log(`[Worker] Processing submission ${submissionId}...`);

        const submittedResult = await Submission.findById(submissionId);
        const problem = await Problem.findById(problemId);

        if (!submittedResult || !problem) return;

        // 1. Submit test cases to Judge0
        const languageId = getLanguageById(language);
        const submissions = problem.hiddenTestCases.map((testcase) => ({
            source_code: code,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output,
        }));

        const submitResult = await submitBatch(submissions);
        const resultToken = submitResult.map((val) => val.token);
        const testResult = await submitToken(resultToken);

        // 2. Calculate results
        let testCasesPassed = 0;
        let runtime = 0;
        let memory = 0;
        let status = "accepted";
        let errorMessage = null;

        for (const test of testResult) {
            if (test.status_id == 3) {
                testCasesPassed++;
                runtime += parseFloat(test.time || 0);
                memory = Math.max(memory, test.memory || 0);
            } else {
                status = test.status_id == 4 ? "error" : "Wrong";
                errorMessage = test.stderr || "Test case failed";
            }
        }

        // 3. Update Submission document in MongoDB
        submittedResult.status = status;
        submittedResult.testCasesPassed = testCasesPassed;
        submittedResult.testCasesTotal = problem.hiddenTestCases.length;
        submittedResult.errorMessage = errorMessage;
        submittedResult.runtime = runtime;
        submittedResult.memory = memory;
        await submittedResult.save();

        // 4. Update User's problemSolved list if accepted
        if (status === "accepted") {
            const user = await User.findById(userId);
            if (user && !user.problemSolved.includes(problemId)) {
                user.problemSolved.push(problemId);
                await user.save();
            }
        }

        console.log(`[Worker] Finished submission ${submissionId} with status: ${status}`);
    },
    {
        connection,
        concurrency: 2 // 👈 Process max 2 submissions concurrently
    }
);

module.exports = submissionWorker;
