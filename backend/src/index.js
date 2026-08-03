require("./workers/submissionWorkers");
const express = require("express");
const app = express();
require("dotenv").config();
const main = require("./config/db");
const cookieParser = require("cookie-parser");
const authRouter = require('./routes/userAuth');
const redisClient = require("./config/redis");
const problemRouter = require("./routes/problemCreator");
const submitRouter = require("./routes/submit");
const cors = require("cors");
const aiRouter = require("./routes/aiChatting");
const chalk = require("chalk");
const videoRouter = require("./routes/videoCreator");
const discussionRouter = require("./routes/discussion.routes");
const notesRouter = require("./routes/notes");
const profileRouter = require("./routes/profile");
const promBundle = require("express-prom-bundle");

// Set up Prometheus middleware to track HTTP requests and expose default Node.js metrics
const metricsMiddleware = promBundle({
    includeMethod: true,
    includePath: true,
    includeStatusCode: true,
    includeUp: true,
    promClient: {
        collectDefaultMetrics: {} // collect memory, CPU, and event loop metrics
    }
});

app.set("trust proxy", 1);
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))

// convert req.body data into JS object as it comes in JSON format 
// app.use(express.json());
app.use(cookieParser());
app.use(metricsMiddleware); // Apply metrics tracking to all routes


// API health
app.get("/", async (req, res) => {
    try {
        res.status(200).json({
            status: "ok",
            service: "api",
            uptime: process.uptime()
        });
    } catch (error) {
        console.error("Health check failed:", error);

        res.status(500).json({
            status: "error",
            message: "Health check failed"
        });
    }
});


app.use("/user", express.json({ limit: "10kb" }), authRouter);
app.use("/problem", express.json({ limit: "500kb" }), problemRouter);
app.use("/submission", express.json({ limit: "500kb" }), submitRouter);
app.use("/ai", express.json({ limit: "30kb" }), aiRouter);
app.use("/video", videoRouter);
app.use("/discussion", express.json({ limit: "10mb" }), discussionRouter);
app.use("/editorial", express.json({ limit: "500kb" }), require("./routes/editorial.routes"));
app.use("/solutions", express.json({ limit: "500kb" }), require("./routes/solution.routes"));
app.use("/notes", express.json({ limit: "1mb" }), notesRouter);
app.use("/profile", express.json({ limit: "500kb" }), profileRouter);

// connect DB and redist then start server
const initializeConnection = async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
        await main();      // connect DB
        console.log(chalk.green("DB & Redis Connected"));

        app.listen(process.env.PORT, () => {
            console.log(chalk.green(`Server running at http://localhost:${process.env.PORT}`));
        })
    } catch (err) {
        console.log("Error: " + err);
    }
}

initializeConnection();

if (process.env.NODE_ENV === "production" && process.env.BACKEND_URL) {
    const FOURTEEN_MINUTES = 14 * 60 * 1000;

    setInterval(async () => {
        try {
            await fetch(`${process.env.BACKEND_URL}/`);
            console.log("Keep alive self ping successful")
        } catch (err) {
            console.error("Self ping failed: ", err.message);
        }
    }, FOURTEEN_MINUTES);
}
module.exports = app;
