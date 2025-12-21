const express = require("express");
const submitRouter = express.Router();
const userMiddleware = require("../middleware/userMiddleware");
const { submitCode, runCode } = require("../controllers/userSubmission");
const { getSubmissionStats } = require("../controllers/submissionStats");


submitRouter.post("/submit/:id", userMiddleware, submitCode);
submitRouter.post("/run/:id", userMiddleware, runCode);
submitRouter.get("/stats", userMiddleware, getSubmissionStats);

module.exports = submitRouter;