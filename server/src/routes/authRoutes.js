import express from 'express';
import { z } from 'zod';
import { register, login, getMe } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';

const router = express.Router();

const registerSchema = z.object({
  email: z.string().email('Valid email address required'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  name: z.string().optional(),
  role: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email('Valid email address required'),
  password: z.string().min(1, 'Password is required')
});

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', authenticateToken, getMe);

export default router;
