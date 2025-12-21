const express = require("express");
const problemRouter = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware")
const { createProblem, updateProblem, deleteProblem, getProblemById, getAllProblems, solvedAllProblemByUser, submittedProblem, getUserSubmissionStats } = require("../controllers/userProblems")
const userMiddleware = require("../middleware/userMiddleware")





// problem create with admin access(permission)
problemRouter.post("/create", adminMiddleware, createProblem);

// patch
problemRouter.put("/update/:id", adminMiddleware, updateProblem)       // which problem need to update using id

// delete
problemRouter.delete("/delete/:id", adminMiddleware, deleteProblem);

// fetch 
problemRouter.get("/problemById/:id", userMiddleware, getProblemById);

// fetch all problems
problemRouter.get("/getAllProblems", userMiddleware, getAllProblems);

// user solved problem
problemRouter.get("/problemSolvedByUser", userMiddleware, solvedAllProblemByUser)

// Get submissions stats for heatmap
problemRouter.get("/getSubmissionStats", userMiddleware, getUserSubmissionStats);

problemRouter.get("/submittedProblem/:pid", userMiddleware, submittedProblem);      // pid: problem id

module.exports = problemRouter;