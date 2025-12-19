const nodemailer = require("nodemailer");

require("dotenv").config();

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

if (!emailUser || !emailPass) {
  console.error("CRITICAL ERROR: EMAIL_USER or EMAIL_PASS is missing in .env file.");
  console.log("User:", emailUser ? "Present" : "Missing");
  console.log("Pass:", emailPass ? "Present" : "Missing");
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  connectionTimeout: 10000
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"Code Nexus" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
};

module.exports = sendEmail;
