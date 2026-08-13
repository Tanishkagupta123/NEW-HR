const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'changeme';

exports.sign = (payload) => jwt.sign(payload, secret, { expiresIn: '7d' });
exports.verify = (token) => jwt.verify(token, secret);
