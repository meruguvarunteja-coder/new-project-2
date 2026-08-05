import express from 'express';
import {
  getDecisions,
  getDecisionById,
  createDecision,
  updateDecision,
  deleteDecision,
  runSimulations
} from '../controllers/decisionController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getDecisions);
router.get('/:id', getDecisionById);
router.post('/', createDecision);
router.put('/:id', updateDecision);
router.delete('/:id', deleteDecision);
router.post('/:id/simulate', runSimulations);

export default router;
