import {
  calculateMCDAScores,
  runMonteCarloSimulation,
  calculateSensitivityAnalysis
} from '../services/mcdaEngine.js';

/**
 * POST /api/decisions/compute
 * Accepts a decision object directly in the body.
 * Returns MCDA, Monte Carlo, and Sensitivity results.
 * No database, no auth — pure stateless computation.
 */
export const computeDecision = async (req, res, next) => {
  try {
    const decision = req.body;

    if (!decision || !decision.criteria || !decision.options) {
      return res.status(400).json({
        success: false,
        message: 'Decision payload must include criteria and options arrays.'
      });
    }

    const mcda = calculateMCDAScores(decision);
    const monteCarlo = runMonteCarloSimulation(decision, 1000);
    const sensitivity = calculateSensitivityAnalysis(decision);

    res.status(200).json({ success: true, mcda, monteCarlo, sensitivity });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/decisions/simulate
 * Run custom simulation with configurable iterations and volatility.
 */
export const runSimulations = async (req, res, next) => {
  try {
    const { decision, iterations = 1000, volatility = 0.15 } = req.body;

    if (!decision) {
      return res.status(400).json({ success: false, message: 'Decision data is required.' });
    }

    const mcda = calculateMCDAScores(decision);
    const monteCarlo = runMonteCarloSimulation(decision, iterations, volatility);
    const sensitivity = calculateSensitivityAnalysis(decision);

    res.status(200).json({ success: true, mcda, monteCarlo, sensitivity });
  } catch (err) {
    next(err);
  }
};
