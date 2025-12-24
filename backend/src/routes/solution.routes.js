const express = require("express");
const solutionRouter = express.Router();
const userMiddleware = require("../middleware/userMiddleware");
const {
    createSolution,
    getSolutions,
    getSolutionById,
    voteSolution,
    addComment,
    deleteSolution
} = require("../controllers/solution.controller");

// Create
solutionRouter.post("/:problemId", userMiddleware, createSolution);

// Get List
solutionRouter.get("/problem/:problemId", userMiddleware, getSolutions);

// Get Detail
solutionRouter.get("/:solutionId", userMiddleware, getSolutionById);

// Vote
solutionRouter.put("/vote/:solutionId", userMiddleware, voteSolution);

// Comment
solutionRouter.post("/comment/:solutionId", userMiddleware, addComment);

// Delete
solutionRouter.delete("/:solutionId", userMiddleware, deleteSolution);

module.exports = solutionRouter;
