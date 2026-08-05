import { verifyToken } from '../config/jwt.js';
import { db } from '../config/db.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication token missing or invalid.' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ success: false, message: 'Token is expired or unauthorized.' });
  }

  const user = db.findUserById(decoded.userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Associated user account not found.' });
  }

  req.user = { id: user.id, email: user.email, name: user.name, role: user.role };
  next();
};
