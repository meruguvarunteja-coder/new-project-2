import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import decisionRoutes from './routes/decisionRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security & CORS
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'OmniDecision AI Engine',
    timestamp: new Date().toISOString(),
    aiKeyConfigured: !!process.env.GEMINI_API_KEY
  });
});

// Routes — no auth required
app.use('/api/decisions', decisionRoutes);
app.use('/api/ai', aiRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
