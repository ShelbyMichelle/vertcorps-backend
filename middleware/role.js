module.exports = (...requiredRoles) => {
  const allowedRoles = requiredRoles.flat().filter(Boolean);

  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Access denied'
      });
    }
    next();
  };
};
