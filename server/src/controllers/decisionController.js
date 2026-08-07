import { supabaseAdmin, isSupabaseEnabled } from '../config/supabase.js';
import { db } from '../config/db.js';
import {
  calculateMCDAScores,
  runMonteCarloSimulation,
  calculateSensitivityAnalysis
} from '../services/mcdaEngine.js';

// ─── Supabase Helper Functions ─────────────────────────────────────────────

/** Map Supabase snake_case row to camelCase decision object */
function mapRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    problemStatement: row.problem_statement,
    industry: row.industry,
    status: row.status,
    criteria: row.criteria || [],
    options: row.options || [],
    scenarioModifiers: row.scenario_modifiers || { marketDownturn: false, costInflationPercent: 0, stringentCompliance: false },
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function dbGetDecisions(userId) {
  if (isSupabaseEnabled) {
    const { data, error } = await supabaseAdmin
      .from('decisions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (!error && data) return data.map(mapRow);
  }
  return db.getDecisions(userId);
}

async function dbGetDecisionById(id) {
  if (isSupabaseEnabled) {
    const { data, error } = await supabaseAdmin
      .from('decisions')
      .select('*')
      .eq('id', id)
      .single();
    if (!error && data) return mapRow(data);
  }
  return db.getDecisionById(id);
}

async function dbCreateDecision(decision) {
  if (isSupabaseEnabled) {
    const { data, error } = await supabaseAdmin
      .from('decisions')
      .insert({
        user_id: decision.userId,
        title: decision.title,
        problem_statement: decision.problemStatement,
        industry: decision.industry,
        status: decision.status,
        criteria: decision.criteria,
        options: decision.options,
        scenario_modifiers: decision.scenarioModifiers
      })
      .select()
      .single();
    if (error) throw new Error('Supabase insert failed: ' + error.message);
    return mapRow(data);
  }
  return db.createDecision(decision);
}

async function dbUpdateDecision(id, updateData) {
  if (isSupabaseEnabled) {
    const patch = {};
    if (updateData.title !== undefined) patch.title = updateData.title;
    if (updateData.problemStatement !== undefined) patch.problem_statement = updateData.problemStatement;
    if (updateData.industry !== undefined) patch.industry = updateData.industry;
    if (updateData.status !== undefined) patch.status = updateData.status;
    if (updateData.criteria !== undefined) patch.criteria = updateData.criteria;
    if (updateData.options !== undefined) patch.options = updateData.options;
    if (updateData.scenarioModifiers !== undefined) patch.scenario_modifiers = updateData.scenarioModifiers;

    const { data, error } = await supabaseAdmin
      .from('decisions')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error('Supabase update failed: ' + error.message);
    return mapRow(data);
  }
  return db.updateDecision(id, updateData);
}

async function dbDeleteDecision(id) {
  if (isSupabaseEnabled) {
    const { error } = await supabaseAdmin
      .from('decisions')
      .delete()
      .eq('id', id);
    if (error) throw new Error('Supabase delete failed: ' + error.message);
    return true;
  }
  return db.deleteDecision(id);
}

// ─── Controller Handlers ───────────────────────────────────────────────────

export const getDecisions = async (req, res, next) => {
  try {
    const decisions = await dbGetDecisions(req.user.id);
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

export const getDecisionById = async (req, res, next) => {
  try {
    const decision = await dbGetDecisionById(req.params.id);
    if (!decision) {
      return res.status(404).json({ success: false, message: 'Decision scenario not found.' });
    }

    const mcda = calculateMCDAScores(decision);
    const monteCarlo = runMonteCarloSimulation(decision, 1000);
    const sensitivity = calculateSensitivityAnalysis(decision);

    res.status(200).json({ success: true, decision, mcda, monteCarlo, sensitivity });
  } catch (err) {
    next(err);
  }
};

export const createDecision = async (req, res, next) => {
  try {
    const { title, problemStatement, industry, criteria, options, scenarioModifiers } = req.body;

    const newDecision = {
      userId: req.user.id,
      title: title || 'Untitled Strategic Decision',
      problemStatement: problemStatement || '',
      industry: industry || 'Enterprise Strategy',
      status: 'draft',
      criteria: criteria || [],
      options: options || [],
      scenarioModifiers: scenarioModifiers || { marketDownturn: false, costInflationPercent: 0, stringentCompliance: false }
    };

    const created = await dbCreateDecision(newDecision);
    const mcda = calculateMCDAScores(created);

    res.status(201).json({
      success: true,
      message: 'Decision scenario created successfully',
      decision: created,
      mcda
    });
  } catch (err) {
    next(err);
  }
};

export const updateDecision = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await dbGetDecisionById(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Decision scenario not found.' });
    }
    if (existing.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this decision.' });
    }

    const updated = await dbUpdateDecision(id, req.body);
    const mcda = calculateMCDAScores(updated);

    res.status(200).json({ success: true, message: 'Updated successfully', decision: updated, mcda });
  } catch (err) {
    next(err);
  }
};

export const deleteDecision = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await dbGetDecisionById(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Decision not found.' });
    }
    if (existing.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this decision.' });
    }

    await dbDeleteDecision(id);
    res.status(200).json({ success: true, message: 'Decision deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

export const runSimulations = async (req, res, next) => {
  try {
    const decision = await dbGetDecisionById(req.params.id);
    if (!decision) {
      return res.status(404).json({ success: false, message: 'Decision not found.' });
    }

    const iterations = req.body.iterations || 1000;
    const volatility = req.body.volatility || 0.15;

    const mcda = calculateMCDAScores(decision);
    const monteCarlo = runMonteCarloSimulation(decision, iterations, volatility);
    const sensitivity = calculateSensitivityAnalysis(decision);

    res.status(200).json({ success: true, mcda, monteCarlo, sensitivity });
  } catch (err) {
    next(err);
  }
};
