const { AuditLog } = require('../models');

const getClientIp = (req) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || null;
};

const logEvent = async ({ userId, eventType, method = null, path = null, req = null }) => {
  if (!userId || !eventType) return;

  try {
    await AuditLog.create({
      user_id: userId,
      event_type: eventType,
      method,
      path,
      ip_address: req ? getClientIp(req) : null,
      user_agent: req?.headers?.['user-agent'] || null,
    });
  } catch (error) {
    console.error('Failed to write audit log:', error.message);
  }
};

module.exports = {
  logEvent,
};
