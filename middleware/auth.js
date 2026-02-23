const jwt = require('jsonwebtoken');
const { logEvent } = require('../services/auditLogger');

const AUDIT_SKIP_PATHS = ['/api/admin/audit-logs'];

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = decoded;

    const shouldSkipAudit = AUDIT_SKIP_PATHS.some((path) => req.originalUrl.startsWith(path));
    if (!shouldSkipAudit) {
      logEvent({
        userId: decoded.id,
        eventType: 'API_ACCESS',
        method: req.method,
        path: req.originalUrl,
        req,
      });
    }

    next();

  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
