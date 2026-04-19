const db = require("../models");
const sendMail = require("../config/mailer");

exports.contactDeveloper = async (req, res) => {
  try {
    const { subject, message } = req.body || {};

    if (!message || String(message).trim().length === 0) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const user = await db.User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "role", "district"],
    });

    const resolvedSubject = (subject && String(subject).trim()) || "VERTCORPS Portal message";
    const to = process.env.SUPPORT_TO || process.env.MAIL_USER;

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2 style="margin:0 0 10px 0;">${escapeHtml(resolvedSubject)}</h2>
        <p style="white-space: pre-wrap; margin:0 0 16px 0;">${escapeHtml(String(message).trim())}</p>
        <hr />
        <p style="margin: 12px 0 0 0; font-size: 12px; color: #555;">
          From: ${escapeHtml(user?.name || "Unknown")} (${escapeHtml(user?.email || "No email")})<br/>
          Role: ${escapeHtml(user?.role || "—")}<br/>
          District: ${escapeHtml(user?.district || "—")}<br/>
          User ID: ${escapeHtml(String(user?.id || req.user.id))}
        </p>
      </div>
    `;

    await sendMail({ to, subject: resolvedSubject, html });

    res.json({ success: true, message: "Message sent" });
  } catch (err) {
    console.error("Support contact error:", err);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

module.exports = exports;

