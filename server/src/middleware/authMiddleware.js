import { supabaseAdmin, isSupabaseEnabled } from '../config/supabase.js';
import { verifyToken } from '../config/jwt.js';
import { db } from '../config/db.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication token missing or invalid.' });
  }

  // 1. Try Supabase JWT verification (primary path)
  if (isSupabaseEnabled) {
    try {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (user && !error) {
        req.user = {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email.split('@')[0],
          role: user.user_metadata?.role || 'Decision Strategist',
          authProvider: 'supabase'
        };
        return next();
      }
    } catch (err) {
      // Fall through to legacy JWT verification
    }
  }

  // 2. Fallback: Legacy custom JWT (for backward compatibility)
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ success: false, message: 'Token is expired or unauthorized.' });
  }

  const user = db.findUserById(decoded.userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Associated user account not found.' });
  }

  req.user = { id: user.id, email: user.email, name: user.name, role: user.role, authProvider: 'legacy' };
  next();
};
