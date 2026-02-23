// services/notificationEmailService.js
const { sendEmail } = require('../utils/emailService');
const emailTemplates = require('../utils/emailTemplates');

/**
 * Send notification email to a user
 * @param {number} userId - User ID to send to
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} portalLink - Optional portal link
 */
async function sendNotificationEmail(user, title, message, portalLink = '') {
  if (!user || !user.email) {
    console.warn('notificationEmailService: user or email missing', user);
    return;
  }

  try {
    const html = emailTemplates.notificationEmail(title, message, portalLink);
    await sendEmail(user.email, title, html);
    console.log(`📧 Notification email sent to ${user.email} (${title})`);
  } catch (err) {
    console.error('notificationEmailService: failed to send email', err.message);
  }
}

module.exports = { sendNotificationEmail };
