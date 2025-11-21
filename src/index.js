const express = require("express");
const app = express();
require("dotenv").config();
const main = require("./config/db");
const cookieParser = require("cookie-parser");
const authRouter = require('./routes/userAuth');
const redisClient = require("./config/redis");
const problemRouter = require("./routes/problemCreator");

app.use(express.json());     // convert req.body data into JS object as it comes in JSON format 
app.use(cookieParser());

app.use("/user", authRouter);
app.use("/problem", problemRouter);

// connect DB and redist then start server
const initializeConnection = async () => {
    try {
        await Promise.all([main(), redisClient.connect()])      // connect DB & redis
        console.log("DB Connected");

        app.listen(process.env.PORT, () => {
            console.log(`Server running at localhost:${process.env.PORT}`);
        })
    } catch(err) {
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
