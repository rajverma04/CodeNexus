const cloudinary = require("cloudinary").v2;
const Problem = require("../models/problems");
const User = require("../models/user");
const SolutionVideo = require("../models/solutionVideos");
require("dotenv").config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const generateUploadSignature = async (req, res) => {
    try {
        const { problemId } = req.params;       // from params
        const userId = req.result._id;     // from admin middleware

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({
                error: "Problem not found"
            })
        }

        // Generate unique public_id for the video
        const timestamp = Math.round(new Date().getTime() / 1000);
        const publicId = `CodeNexus-solution/${problemId}/${userId}_${timestamp}`;


        // upload parameter
        const uploadParams = {
            timestamp: timestamp,
            public_id: publicId
        }


        // generate signature
        const signature = cloudinary.utils.api_sign_request(
            uploadParams,
            process.env.CLOUDINARY_API_SECRET.trim()
        )

        // Check if env vars are loaded
        // console.log("CLOUDINARY CONFIG:", {
        //     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        //     api_key: process.env.CLOUDINARY_API_KEY,
        //     api_secret_exists: !!process.env.CLOUDINARY_API_SECRET
        // });

        // console.log("SIGNATURE PARAMS:", {
        //     uploadParams,
        //     signature
        // });

        res.json({
            signature,
            timestamp,
            public_id: publicId,
            api_key: process.env.CLOUDINARY_API_KEY.trim(),
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`
        })
    } catch (error) {
        console.error("Error generating upload signature: ", error);
        res.status(500).json({
            error: "Failed to generate upload credentials"
        })
    }
}


const saveVideoMetaData = async (req, res) => {
    try {
        const {
            problemId,
            cloudinaryPublicId,
            // cloudinaryURL,   // no needed
            secureURL,
            duration,
        } = req.body;

        const userId = req.result._id;

        // verify the upload with cloudinary
        const cloudinaryResourse = await cloudinary.api.resource(
            cloudinaryPublicId,
            { resource_type: "video" }
        )

        if (!cloudinaryResourse) {
            return res.status(400).json({
                error: "Video not found on Cloudinary"
            })
        }

        // Check video already present for this problem and user
        const existingVideo = await SolutionVideo.findOne({
            problemId,
            userId,
            cloudinaryPublicId
        })

        if (existingVideo) {
            return res.status(409).json({
                error: "Video already exist"
            })
        }

        const thumbnailURL = cloudinary.url(cloudinaryResourse.public_id, {
            resource_type: "video",
            transformation: [
                {
                    width: 400,
                    height: 225,
                    crop: "fill"
                },
                {
                    quality: "auto",
                },
                {
                    start_offset: "auto"
                },
            ],
            format: "jpg"
        })

        // const thumbnailURL = cloudinary.image(cloudinaryPublicId, { resource_type: "video" })

        // create video solution record
        const videoSolution = await SolutionVideo.create({
            problemId,
            userId,
            cloudinaryPublicId,
            secureURL,
            duration: cloudinaryResourse.duration || duration,
            thumbnailURL
        })

        // await SolutionVideo.save();

        res.status(201).json({
            message: "Video solution saved successfully",
            videoSolution: {
                id: videoSolution._id,
                thumbnailURL: videoSolution.thumbnailURL,
                duration: videoSolution.duration,
                uploadedAt: videoSolution.createdAt
            }
        })
    } catch (error) {
        console.error("Error saving video metadeta: ", error);
        res.status(500).json({
            error: "Failed to save video metadata"
        })
    }
}

const deleteVideo = async (req, res) => {
    try {
        const { problemId } = req.params;
        // const userId = req.result._id; // Not strictly needed if admin can delete any, but good for auditing

        // 1. Find the video first
        const video = await SolutionVideo.findOne({ problemId: problemId });

        if (!video) {
            return res.status(404).json({ error: "Video not found" });
        }

        // 2. Delete from Cloudinary
        // Ensure we handle the case where it might not exist on Cloudinary but does in DB (orphan cleanup)
        // But generally we attempt strict deletion.
        if (video.cloudinaryPublicId) {
            const cloudinaryResult = await cloudinary.uploader.destroy(video.cloudinaryPublicId, {
                resource_type: "video",
                invalidate: true
            });
            console.log("Cloudinary Delete Result:", cloudinaryResult);
        }

        // 3. Delete from Database
        await SolutionVideo.deleteOne({ _id: video._id });

        res.status(200).json({
            message: "Video deleted successfully"
        })
    } catch (error) {
        console.error("Error deleting video: ", error);
        res.status(500).json({
            error: "Failed to delete video"
        })
    }
}



const getAllVideos = async (req, res) => {
    try {
        const videos = await SolutionVideo.find({})
            .populate({
                path: "problemId",
                select: "title difficulty tags"
            })
            .sort({ createdAt: -1 });

        res.status(200).json(videos);
    } catch (error) {
        console.error("Error fetching videos:", error);
        res.status(500).json({ error: "Failed to fetch video solutions" });
    }
}

module.exports = { generateUploadSignature, saveVideoMetaData, deleteVideo, getAllVideos };
