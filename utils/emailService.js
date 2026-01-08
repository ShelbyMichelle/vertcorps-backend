// utils/emailService.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: `"ESMP Portal" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log("📧 Email sent:", subject);
  } catch (error) {
    console.error("❌ Email error:", error.message);
  }
}

module.exports = { sendEmail };
