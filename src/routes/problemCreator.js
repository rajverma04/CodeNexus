const express = require("express");
const problemRouter = express.Router();





// problem create with admin access(permission)
problemRouter.post("/create", problemCreate);

// fetch
problemRouter.get("/:id", problemFetch);    // fetch 
problemRouter.get("/", getAllProblems);       // fetch all problems

// update
problemRouter.patch("/:id", problemUpdate)       // which problem need to update using id

// delete
problemRouter.delete("/:id", problemDelete);

// user solved problem
problemRouter.get("/user", solvedProblem)
