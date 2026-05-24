// src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer '))
    return res.status(401).json({ success: false, message: 'Unauthorized' });

  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

exports.requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN')
    return res.status(403).json({ success: false, message: 'Admin access required' });
  next();
};
