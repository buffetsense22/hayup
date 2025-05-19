require("dotenv").config(); // Ensures .env is loaded locally

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); // Serves static files (verify.html, etc.)

const otpStore = new Map();

// Nodemailer transporter using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,          // Set in Render's Environment tab
    pass: process.env.EMAIL_PASSWORD // App password from Gmail
  }
});

// Endpoint to send OTP
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email required." });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, otp);

  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}`
    });

    res.json({ success: true, message: "OTP sent to your email." });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP." });
  }
});

// Endpoint to verify OTP
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (otpStore.get(email) === otp) {
    otpStore.delete(email);
    res.json({ success: true, message: "OTP verified successfully!" });
  } else {
    res.status(401).json({ success: false, message: "Invalid or expired OTP." });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
