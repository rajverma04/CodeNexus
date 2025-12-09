const express = require("express");
const userMiddleware = require("../middleware/userMiddleware");
const aiRouter = express.Router();
const solveDoubt = require("../controllers/solveDoubt")


aiRouter.post("/chat", userMiddleware, solveDoubt);


module.exports = aiRouter;