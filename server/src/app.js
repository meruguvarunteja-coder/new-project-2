import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import decisionRoutes from './routes/decisionRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security and CORS middleware
app.use(helmet());
app.use(cors({
  origin: '*', // Allow all origins for dev/testing ease
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'OmniDecision AI Engine',
    timestamp: new Date().toISOString(),
    aiKeyConfigured: !!process.env.GEMINI_API_KEY
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/decisions', decisionRoutes);
app.use('/api/ai', aiRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
