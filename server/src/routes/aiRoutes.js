import express from 'express';
import { parseScenarioText, generateDecisionAnalysis } from '../controllers/aiController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/parse-scenario', parseScenarioText);
router.post('/analyze-decision', generateDecisionAnalysis);

export default router;
