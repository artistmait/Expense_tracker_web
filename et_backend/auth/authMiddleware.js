import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../config/db.js';

// SECURITY (audit fix #2): single source of truth for the JWT secret.
// No hardcoded fallback — see authController.js for the same policy.
const JWT_SECRET = process.env.JWT_SECRET
  || (process.env.NODE_ENV === 'production' ? null : crypto.randomBytes(32).toString('hex'));
if (!JWT_SECRET) {
  console.error('[Config] FATAL: JWT_SECRET is required when NODE_ENV=production.');
  process.exit(1);
}

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    // Verify user still exists in database and is active
    const userResult = await query(
      'SELECT id, username, full_name, email, status FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User account no longer exists.',
      });
    }

    const user = userResult.rows[0];

    if (user.status === false) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.',
      });
    }

    // Attach user payload to request
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session has expired. Please sign in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid or malformed authentication token.',
    });
  }
};
