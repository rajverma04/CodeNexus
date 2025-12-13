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

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))


app.use(express.json());     // convert req.body data into JS object as it comes in JSON format 
app.use(cookieParser());

app.use("/user", authRouter);
app.use("/problem", problemRouter);
app.use("/submission", submitRouter);
app.use("/ai", aiRouter);
app.use("/video", videoRouter);

// connect DB and redist then start server
const initializeConnection = async () => {
    try {
        await Promise.all([main(), redisClient.connect()])      // connect DB & redis
        console.log(chalk.green("DB Connected"));

        app.listen(process.env.PORT, () => {
            console.log(chalk.green(`Server running at http://localhost:${process.env.PORT}`));
        })
    } catch (err) {
        console.log("Error: " + err);
    }
}

initializeConnection();

// main()
//     .then(async () => {
//         app.listen(process.env.PORT, () => {
//             console.log(`Server running at ${process.env.PORT}`);
//         })
//     })
//     .catch(err => console.log("Error: " + err));
