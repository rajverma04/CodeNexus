const express = require("express");
const adminMiddleware = require("../middleware/adminMiddleware");
const videoRouter = express.Router();

const { generateUploadSignature, saveVideoMetaData, deleteVideo, getAllVideos } = require("../controllers/videoSection");

videoRouter.get("/create/:problemId", adminMiddleware, generateUploadSignature);
videoRouter.post("/save", adminMiddleware, saveVideoMetaData);
videoRouter.delete("/delete/:problemId", adminMiddleware, deleteVideo);
videoRouter.get("/all", adminMiddleware, getAllVideos);


module.exports = videoRouter;