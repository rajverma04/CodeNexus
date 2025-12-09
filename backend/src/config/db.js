const mongoose = require("mongoose");
require("dotenv").config();

async function main() {
    await mongoose.connect(process.env.DB_CONNECTION_STRING);
}

module.exports = main;