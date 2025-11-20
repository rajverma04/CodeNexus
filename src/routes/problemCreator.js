const express = require("express");
const problemRouter = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware")





// problem create with admin access(permission)
problemRouter.post("/create", adminMiddleware, createProblem);

// fetch
problemRouter.get("/:id", getProblemById);    // fetch 
problemRouter.get("/", getAllProblems);       // fetch all problems

// update
problemRouter.patch("/:id", updateProblem)       // which problem need to update using id

// delete
problemRouter.delete("/:id", deleteProblem);

// user solved problem
problemRouter.get("/user", solvedAllProblemByUser)
