const axios = require("axios");
require("dotenv").config();

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY is missing in environment variables");
  }

  const data = {
    sender: {
      name: "CodeNexus",
      email: process.env.EMAIL_USER // Verify this email in Brevo
    },
    to: [
      {
        email: to,
        name: to
      }
    ],
    subject: subject,
    htmlContent: html
  };

  try {
    await axios.post("https://api.brevo.com/v3/smtp/email", data, {
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json"
      }
    });
    console.log("Email sent successfully via Brevo");
  } catch (error) {
    console.error("Brevo Email Error:", error.response?.data || error.message);
    throw new Error("Failed to send email via Brevo");
  }
};

module.exports = sendEmail;
