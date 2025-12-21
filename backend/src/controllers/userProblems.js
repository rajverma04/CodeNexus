const mongoose = require("mongoose");
const Problem = require("../models/problems");
const Submission = require("../models/submission");
const User = require("../models/user");
const { getLanguageById, submitBatch, submitToken } = require("../utils/problemUtility");
const SolutionVideo = require("../models/solutionVideos")

const createProblem = async (req, res) => {
    const { title, description, difficulty,
        tags, visibleTestCases, hiddenTestCases,
        startCode, problemCreator, referenceSolution } = req.body;

    try {
        // source_code
        // language_id
        // stdin from visibleTestCases
        // expected_output
        for (const { language, completeCode } of referenceSolution) {
            const languageId = getLanguageById(language);

            // create batch for code submission in array
            const submissions = visibleTestCases.map((testcase) => ({
                source_code: completeCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output,
            }))
            const submitResult = await submitBatch(submissions);
            console.log(submitResult)
            const resultToken = submitResult.map((value) => value.token);       // return token for batch submission

            const testResult = await submitToken(resultToken);
            // console.log(testResult);

            for (const test of testResult) {
                if (test.status_id != 3) {       // if error is present
                    return res.status(400).send("Error Occured")
                }
            }
        }

        // now we can store in database as there is no error now
        await Problem.create({
            ...req.body,
            problemCreator: req.result._id      // problem creater userId
        })

        res.status(201).send("Problem Saved Successfully");
    } catch (err) {
        console.log("hello")
        res.status(400).send("Error: " + err);
    }
}

const updateProblem = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) {
            return res.status(400).send("Invalid Id Field");
        }

        const DsaProblem = await Problem.findById(id);
        if (!DsaProblem) {
            return res.status(404).send("ID is not present in server");
        }

        const { title, description, difficulty,
            tags, visibleTestCases, hiddenTestCases,
            startCode, problemCreator, referenceSolution } = req.body;
        for (const { language, completeCode } of referenceSolution) {
            const languageId = getLanguageById(language);

            // create batch for code submission in array
            const submissions = visibleTestCases.map((testcase) => ({
                source_code: completeCode,
                language_id: languageId,
                stdin: testcase.input,
                expected_output: testcase.output,
            }))
            const submitResult = await submitBatch(submissions);
            console.log(submitResult)
            const resultToken = submitResult.map((value) => value.token);       // return token for batch submission

            const testResult = await submitToken(resultToken);
            // console.log(testResult);

            for (const test of testResult) {
                if (test.status_id != 3) {       // if error is present
                    return res.status(400).send("Error Occured")
                }
            }
        }
        const newProblem = await Problem.findByIdAndUpdate(id, { ...req.body }, { runValidators: true, new: true });
        res.status(200).send(newProblem);
    } catch (err) {
        res.status(500).send("Error: " + err);
    }
}

const deleteProblem = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) {
            return res.status(400).send("ID is missing");
        }

        const deletedProblem = await Problem.findByIdAndDelete(id);
        if (!deletedProblem) {
            return res.status(404).send("Problem is missing");
        }
        res.status(200).send("Successfully Deleted");
    } catch (err) {
        res.status(500).send("Error: " + err);
    }

}

const getProblemById = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) {
            return res.status(400).send("ID is missing");
        }

        // it will get all details bydefault
        // const getProblem = await Problem.findById(id);

        // to get only selected 
        const getProblem = await Problem.findById(id).select("_id title description difficulty tags visibleTestCases hiddenTestCases startCode referenceSolution");     // it will fetch only selected field

        if (!getProblem) {
            return res.status(404).send("Problem is missing");
        }

        // get video url also for problem
        const videos = await SolutionVideo.findOne({ problemId: id })
        if (videos) {

            const problemObj = {        // Mongoose results are immutable by default, convert to javascript object to add properties
                ...getProblem.toObject(),
                secureURL: videos.secureURL,
                cloudinaryPublicId: videos.cloudinaryPublicId,
                thumbnailURL: videos.thumbnailURL,
                duration: videos.duration,
            }

            return res.status(201).send(problemObj);
        }

        // if video does not exist the this below will return
        res.status(200).send(getProblem);
    } catch (err) {
        res.status(500).send("Error: " + err);
    }

}

const getAllProblems = async (req, res) => {

    try {

        const getProblem = await Problem.find({}).select("_id title difficulty tags")       // all problem fetched from database, return arrays
        if (getProblem.length == 0) {
            return res.status(404).send("Problem is missing");
        }
        res.status(200).send(getProblem);
    } catch (err) {
        res.status(500).send("Error: " + err);
    }

}

const solvedAllProblemByUser = async (req, res) => {
    try {
        // const count = req.result.problemSolved.length;
        const userId = req.result._id;
        // const user = await User.findById(userId).populate("problemSolved")       // it will return the refenrece of ID of problemID and return everything about the problemSolved

        const user = await User.findById(userId).populate({
            path: "problemSolved",
            select: "_id title difficulty tags"
        })
        res.status(200).send(user.problemSolved);

    } catch (err) {
        res.status(500).send("Error: " + err);
    }
}

const submittedProblem = async (req, res) => {
    try {
        const userId = req.result._id;
        const problemId = req.params.pid;

        const answer = await Submission.find({ userId, problemId });

        if (answer.length === 0) {
            res.status(200).send("No submission present");
        }

        res.status(200).send(answer);
    } catch (err) {
        res.status(500).send("Interal Server Error");
    }
}

const getUserSubmissionStats = async (req, res) => {
    try {
        const userId = req.result._id;

        const stats = await Submission.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    status: "accepted"
                }
            },
            {
                $project: {
                    date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
                }
            },
            {
                $group: {
                    _id: "$date",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        // Transform to { date, count } format
        const formattedStats = stats.map(item => ({
            date: item._id,
            count: item.count
        }));

        res.status(200).send(formattedStats);
    } catch (err) {
        res.status(500).send("Error: " + err);
    }
}

module.exports = { createProblem, updateProblem, deleteProblem, getProblemById, getAllProblems, solvedAllProblemByUser, submittedProblem, getUserSubmissionStats };
