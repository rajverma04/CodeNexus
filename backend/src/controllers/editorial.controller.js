const Editorial = require("../models/editorial");
const User = require("../models/user");

// Create or Update Editorial (Admin Only)
const createEditorial = async (req, res) => {
    try {
        const { problemId } = req.params;
        const { content, code, tags } = req.body;
        const userId = req.result._id;

        // Verify admin
        const user = await User.findById(userId);
        if (user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Unauthorized. Admin access required." });
        }

        let editorial = await Editorial.findOne({ problemId });

        if (editorial) {
            // Update existing
            editorial.content = content || editorial.content;
            editorial.code = code || editorial.code;
            editorial.tags = tags || editorial.tags;
            await editorial.save();
            return res.status(200).json({ success: true, editorial, message: "Editorial updated" });
        }

        // Create new
        editorial = new Editorial({
            problemId,
            content,
            code,
            tags,
            createdBy: userId
        });

        await editorial.save();
        res.status(201).json({ success: true, editorial });

    } catch (error) {
        console.error("Error creating editorial:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get Editorial for Problem
const getEditorial = async (req, res) => {
    try {
        const { problemId } = req.params;

        const editorial = await Editorial.findOne({ problemId });

        if (!editorial) {
            return res.status(404).json({ success: false, message: "Editorial not found" });
        }

        res.status(200).json({ success: true, editorial });

    } catch (error) {
        console.error("Error fetching editorial:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

module.exports = {
    createEditorial,
    getEditorial
};
