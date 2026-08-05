import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';
import { signToken } from '../config/jwt.js';

export const register = async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;

    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      email: email.toLowerCase(),
      name: name || email.split('@')[0],
      role: role || 'Decision Strategist',
      passwordHash,
      createdAt: new Date().toISOString()
    };

    db.createUser(user);

    const token = signToken({ userId: user.id, email: user.email });

    db.addAuditLog({ userId: user.id, action: 'USER_REGISTER', details: { email: user.email } });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = signToken({ userId: user.id, email: user.email });

    db.addAuditLog({ userId: user.id, action: 'USER_LOGIN', details: { email: user.email } });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
};
