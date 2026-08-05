import { db } from '../config/db.js';
import {
  calculateMCDAScores,
  runMonteCarloSimulation,
  calculateSensitivityAnalysis
} from '../services/mcdaEngine.js';

export const getDecisions = (req, res, next) => {
  try {
    const decisions = db.getDecisions(req.user.id);
    const enriched = decisions.map(d => {
      const mcda = calculateMCDAScores(d);
      return {
        ...d,
        mcdaSummary: {
          topOption: mcda.topOption?.optionName || 'N/A',
          topScore: mcda.topOption?.normalizedScore || 0,
          optionCount: d.options?.length || 0,
          criteriaCount: d.criteria?.length || 0
        }
      };
    });

    res.status(200).json({ success: true, count: enriched.length, decisions: enriched });
  } catch (err) {
    next(err);
  }
};

export const getDecisionById = (req, res, next) => {
  try {
    const { id } = req.params;
    const decision = db.getDecisionById(id);

    if (!decision) {
      return res.status(404).json({ success: false, message: 'Decision scenario not found.' });
    }

    const mcda = calculateMCDAScores(decision);
    const monteCarlo = runMonteCarloSimulation(decision, 1000);
    const sensitivity = calculateSensitivityAnalysis(decision);

    res.status(200).json({
      success: true,
      decision,
      mcda,
      monteCarlo,
      sensitivity
    });
  } catch (err) {
    next(err);
  }
};

export const createDecision = (req, res, next) => {
  try {
    const { title, problemStatement, industry, criteria, options, scenarioModifiers } = req.body;

    const newDecision = {
      id: 'dec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: req.user.id,
      title: title || 'Untitled Strategic Decision',
      problemStatement: problemStatement || '',
      industry: industry || 'Enterprise Strategy',
      status: 'draft',
      criteria: criteria || [],
      options: options || [],
      scenarioModifiers: scenarioModifiers || { marketDownturn: false, costInflationPercent: 0, stringentCompliance: false },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.createDecision(newDecision);
    db.addAuditLog({ userId: req.user.id, action: 'DECISION_CREATED', details: { decisionId: newDecision.id, title: newDecision.title } });

    const mcda = calculateMCDAScores(newDecision);

    res.status(201).json({
      success: true,
      message: 'Decision scenario created successfully',
      decision: newDecision,
      mcda
    });
  } catch (err) {
    next(err);
  }
};

export const updateDecision = (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = db.getDecisionById(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Decision scenario not found.' });
    }

    if (existing.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this decision.' });
    }

    const updated = db.updateDecision(id, req.body);
    const mcda = calculateMCDAScores(updated);

    db.addAuditLog({ userId: req.user.id, action: 'DECISION_UPDATED', details: { decisionId: id } });

    res.status(200).json({
      success: true,
      message: 'Decision scenario updated successfully',
      decision: updated,
      mcda
    });
  } catch (err) {
    next(err);
  }
};

export const deleteDecision = (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = db.getDecisionById(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Decision scenario not found.' });
    }

    if (existing.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this decision.' });
    }

    db.deleteDecision(id);
    db.addAuditLog({ userId: req.user.id, action: 'DECISION_DELETED', details: { decisionId: id } });

    res.status(200).json({ success: true, message: 'Decision scenario deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

export const runSimulations = (req, res, next) => {
  try {
    const { id } = req.params;
    const decision = db.getDecisionById(id);

    if (!decision) {
      return res.status(404).json({ success: false, message: 'Decision scenario not found.' });
    }

    const iterations = req.body.iterations || 1000;
    const volatility = req.body.volatility || 0.15;

    const mcda = calculateMCDAScores(decision);
    const monteCarlo = runMonteCarloSimulation(decision, iterations, volatility);
    const sensitivity = calculateSensitivityAnalysis(decision);

    res.status(200).json({
      success: true,
      mcda,
      monteCarlo,
      sensitivity
    });
  } catch (err) {
    next(err);
  }
};
