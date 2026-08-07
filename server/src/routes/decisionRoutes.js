import express from 'express';
import {
  computeDecision,
  runSimulations
} from '../controllers/decisionController.js';

const router = express.Router();

// No auth — pure computation endpoints
router.post('/compute', computeDecision);
router.post('/simulate', runSimulations);

export default router;
