const mongoose = require("mongoose");
const Problem = require("./src/models/problems");
const Editorial = require("./src/models/editorial");
const User = require("./src/models/user");
require("dotenv").config();
const main = require("./src/config/db");

const migrateEditorials = async () => {
    try {
        await main();
        console.log("Connected to DB");

        const problems = await Problem.find({});
        console.log(`Found ${problems.length} problems`);

        // Find a fallback admin user to assign creation to
        const admin = await User.findOne({ role: "admin" }) || await User.findOne({});
        const adminId = admin?._id;

        let count = 0;
        for (const problem of problems) {
            // Check if editorial already exists
            const existing = await Editorial.findOne({ problemId: problem._id });
            if (existing) continue;

            if (problem.referenceSolution && problem.referenceSolution.length > 0) {
                // Create editorial from reference solution
                const code = problem.referenceSolution.map(sol => ({
                    language: sol.language,
                    code: sol.completeCode
                }));

                // Extract some content or use default
                const content = `## Official Editorial\n\n### Approach\nThe solution uses a standard algorithm for this problem type.\n\n### Complexity\n- **Time Complexity**: Check code for details.\n- **Space Complexity**: Check code for details.`;

                const editorial = new Editorial({
                    problemId: problem._id,
                    content: content,
                    code: code,
                    tags: problem.tags ? problem.tags.split(",") : [],
                    createdBy: adminId
                });

                await editorial.save();
                console.log(`Migrated editorial for: ${problem.title}`);
                count++;
            }
        }

        console.log(`Migration complete. Created ${count} editorials.`);
        process.exit(0);

    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

migrateEditorials();
