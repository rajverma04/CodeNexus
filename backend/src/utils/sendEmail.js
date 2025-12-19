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
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass
  }
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
