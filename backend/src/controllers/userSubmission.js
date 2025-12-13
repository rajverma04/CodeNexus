const Problem = require("../models/problems");
const Submission = require("../models/submission");
const { getLanguageById, submitBatch, submitToken } = require("../utils/problemUtility")

const submitCode = async (req, res) => {
    try {
        const userId = req.result._id;      // result is from userMiddleware
        const problemId = req.params.id;       // problemId is from params

        let { code, language } = req.body;

        if (language === "cpp") {     // monaco editor uses cpp but judg0 use c++
            language = "c++";
        }
        if (!userId || !problemId || !code || !language) {
            return res.status(400).send("Some Field Missing");
        }

        // fetch the problem fron database
        const problem = await Problem.findById(problemId);

        // store code to database first
        const submittedResult = await Submission.create({
            userId,
            problemId,
            code,
            language,
            status: "pending",
            testCasesTotal: problem.hiddenTestCases.length
        })

        // now submit code to judge0
        const languageId = getLanguageById(language);

        const submissions = problem.hiddenTestCases.map((testcase) => ({
            source_code: code,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output,
        }))
        const submitResult = await submitBatch(submissions);
        const resultToken = submitResult.map((value) => value.token);
        const testResult = await submitToken(resultToken);


        // after getting the response of judge0 first update the submission in DB then send to frontend
        let testCasesPassed = 0;
        let runtime = 0;
        let memory = 0;
        let status = "accepted";
        let errorMessage = null;

        for (const test of testResult) {
            if (test.status_id == 3) {
                testCasesPassed++;
                runtime += parseFloat(test.time);   // string to number
                memory = Math.max(memory, test.memory);
            } else {
                if (test.status_id == 4) {
                    status = "error";
                    errorMessage = test.stderr;
                } else {
                    status = "Wrong";
                    errorMessage = test.stderr;
                }
            }
        }

        //! store the result in database in submission
        submittedResult.status = status;
        submittedResult.testCasesPassed = testCasesPassed;
        submittedResult.errorMessage = errorMessage;
        submittedResult.runtime = runtime;

        await submittedResult.save();

        // ! inserting problemId in problemSolved of User schema if this problem is not solved before
        if (!req.result.problemSolved.includes(problemId)) {
            req.result.problemSolved.push(problemId);
            await req.result.save();
        }

        // res.status(201).send(submittedResult);
        const accepted = (status == "accepted");
        res.status(201).json({
            accepted,      // true or false
            totalTestCases: submittedResult.testCasesTotal,
            passedTestCases: testCasesPassed,
            runtime,
            memory
        });


    } catch (err) {
        res.status(500).send("Error:" + err);
    }
}

const runCode = async (req, res) => {
    // when user run the code sent to judge0 and responded to frontend not saved to DB
    try {
        const userId = req.result._id;      // result is from userMiddleware
        const problemId = req.params.id;       // problemId is from params

        const { code, language } = req.body;

        if (!userId || !problemId || !code || !language) {
            return res.status(400).send("Some Field Missing");
        }

        // fetch the problem fron database
        const problem = await Problem.findById(problemId);

        // now submit code to judge0
        const languageId = getLanguageById(language);

        const submissions = problem.visibleTestCases.map((testcase) => ({
            source_code: code,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output,
        }))
        const submitResult = await submitBatch(submissions);
        const resultToken = submitResult.map((value) => value.token);
        const testResult = await submitToken(resultToken);

        let testCasesPassed = 0;
        let runtime = 0;
        let memory = 0;
        let status = true;
        let errorMessage = null;

        for (const test of testResult) {
            if (test.status_id == 3) {
                testCasesPassed++;
                runtime = runtime + parseFloat(test.time);
                memory = Math.max(memory, test.memory);
            } else {
                if (test.status_id == 4) {
                    status = false;
                    errorMessage = test.stderr;
                } else {
                    status = false;
                    errorMessage = test.stderr;
                }
            }
        }
        // res.status(201).send(testResult);
        res.status(201).json({
            success: status,
            testCases: testResult,
            runtime,
            memory,
            errorMessage
        });


    } catch (err) {
        res.status(500).send("Error:" + err);
    }
}

module.exports = { submitCode, runCode };



// ! testResult response
//     language_id: 105,
//     stdin: '2 3',
//     expected_output: '5',
//     stdout: '5',
//     status_id: 3,
//     created_at: '2025-11-24T10:23:10.587Z',
//     finished_at: '2025-11-24T10:23:12.203Z',
//     time: '0.003',
//     memory: 1736,
//     stderr: null,
//     token: '9989a41f-ac5f-40c1-b54f-90b2b5d11153',