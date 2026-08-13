const jwt = require('../utils/jwt');

module.exports = (req, res, next) => {
  // Get token from Authorization header
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided', message: 'Please log in to continue' });
  }

  try {
    const decoded = jwt.verify(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token', message: 'Please log in again' });
  }
};
