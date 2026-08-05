import { parseScenarioWithGemini, generateExecutiveAnalysisWithGemini } from '../services/geminiService.js';
import { db } from '../config/db.js';
import { calculateMCDAScores, runMonteCarloSimulation } from '../services/mcdaEngine.js';

export const parseScenarioText = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Please provide a descriptive scenario text prompt (min 10 characters).' });
    }

    const structuredMatrix = await parseScenarioWithGemini(prompt);

    res.status(200).json({
      success: true,
      data: structuredMatrix
    });
  } catch (err) {
    next(err);
  }
};

export const generateDecisionAnalysis = async (req, res, next) => {
  try {
    const { decisionId } = req.body;
    let decision = null;

    if (decisionId) {
      decision = db.getDecisionById(decisionId);
    }

    if (!decision && req.body.decisionData) {
      decision = req.body.decisionData;
    }

    if (!decision) {
      return res.status(400).json({ success: false, message: 'Please provide a valid decisionId or decisionData object.' });
    }

    const mcda = calculateMCDAScores(decision);
    const monteCarlo = runMonteCarloSimulation(decision, 1000);

    const executiveAnalysis = await generateExecutiveAnalysisWithGemini(decision, mcda, monteCarlo);

    db.addAuditLog({ userId: req.user?.id || 'anon', action: 'AI_ANALYSIS_GENERATED', details: { title: decision.title } });

    res.status(200).json({
      success: true,
      analysis: executiveAnalysis,
      mcda,
      monteCarlo
    });
  } catch (err) {
    next(err);
  }
};
