const express = require("express");
const editorialRouter = express.Router();
const userMiddleware = require("../middleware/userMiddleware");
const { createEditorial, getEditorial } = require("../controllers/editorial.controller");

// Admin create/update
editorialRouter.post("/:problemId", userMiddleware, createEditorial);

// Get by problem
editorialRouter.get("/:problemId", userMiddleware, getEditorial);

module.exports = editorialRouter;
