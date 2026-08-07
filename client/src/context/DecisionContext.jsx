import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';

const DecisionContext = createContext();

const STORAGE_KEY = 'omnidecision_decisions';

// ─── LocalStorage Helpers ─────────────────────────────────────────────────

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(decisions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decisions));
}

function generateId() {
  return `dec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Provider ─────────────────────────────────────────────────────────────

export const DecisionProvider = ({ children }) => {
  const [decisions, setDecisions] = useState(() => loadFromStorage());
  const [activeDecision, setActiveDecision] = useState(null);
  const [mcdaResults, setMcdaResults] = useState(null);
  const [monteCarloResults, setMonteCarloResults] = useState(null);
  const [sensitivityResults, setSensitivityResults] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState(null);

  // Persist to localStorage on every change
  useEffect(() => {
    saveToStorage(decisions);
  }, [decisions]);

  const fetchDecisions = useCallback(() => {
    setDecisions(loadFromStorage());
  }, []);

  const fetchDecisionById = useCallback(async (id) => {
    const decision = decisions.find(d => d.id === id) || loadFromStorage().find(d => d.id === id);
    if (!decision) {
      setError('Decision not found');
      return null;
    }

    setActiveDecision(decision);

    // Run computation against backend if available
    try {
      setLoading(true);
      const res = await api.post('/decisions/compute', decision);
      if (res.data.success) {
        setMcdaResults(res.data.mcda);
        setMonteCarloResults(res.data.monteCarlo);
        setSensitivityResults(res.data.sensitivity);
      }
      return { decision, ...res.data };
    } catch (err) {
      console.warn('Backend unavailable, using local compute fallback');
      return { decision };
    } finally {
      setLoading(false);
    }
  }, [decisions]);

  const createDecision = async (decisionData) => {
    try {
      setLoading(true);
      const newDecision = {
        ...decisionData,
        id: generateId(),
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setDecisions(prev => {
        const updated = [newDecision, ...prev];
        saveToStorage(updated);
        return updated;
      });

      setActiveDecision(newDecision);

      // Compute MCDA if criteria/options are ready
      if (newDecision.criteria?.length && newDecision.options?.length) {
        try {
          const res = await api.post('/decisions/compute', newDecision);
          if (res.data.success) setMcdaResults(res.data.mcda);
          return { success: true, decision: newDecision, mcda: res.data.mcda };
        } catch {
          return { success: true, decision: newDecision };
        }
      }

      return { success: true, decision: newDecision };
    } catch (err) {
      console.error('Create decision error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateDecision = async (id, updateData) => {
    try {
      const updated = {
        ...updateData,
        id,
        updatedAt: new Date().toISOString()
      };

      setDecisions(prev => {
        const next = prev.map(d => d.id === id ? { ...d, ...updated } : d);
        saveToStorage(next);
        return next;
      });

      setActiveDecision(prev => prev?.id === id ? { ...prev, ...updated } : prev);

      // Recompute analysis
      if (updated.criteria?.length && updated.options?.length) {
        try {
          const res = await api.post('/decisions/compute', updated);
          if (res.data.success) {
            setMcdaResults(res.data.mcda);
            setMonteCarloResults(res.data.monteCarlo);
            setSensitivityResults(res.data.sensitivity);
          }
          return { success: true, decision: updated, mcda: res.data.mcda };
        } catch {
          return { success: true, decision: updated };
        }
      }

      return { success: true, decision: updated };
    } catch (err) {
      console.error('Update decision error:', err);
      throw err;
    }
  };

  const deleteDecision = (id) => {
    setDecisions(prev => {
      const next = prev.filter(d => d.id !== id);
      saveToStorage(next);
      return next;
    });
    if (activeDecision?.id === id) setActiveDecision(null);
  };

  const parseScenarioText = async (prompt) => {
    try {
      setAiLoading(true);
      const res = await api.post('/ai/parse-scenario', { prompt });
      return res.data;
    } catch (err) {
      console.error('AI parse failed:', err);
      throw err;
    } finally {
      setAiLoading(false);
    }
  };

  const generateAIAnalysis = async (decisionId, decisionData = null) => {
    try {
      setAiLoading(true);
      const decision = decisionData || decisions.find(d => d.id === decisionId);
      const res = await api.post('/ai/analyze-decision', { decisionId, decisionData: decision });
      if (res.data.success) {
        setAiAnalysis(res.data.analysis);
        if (res.data.mcda) setMcdaResults(res.data.mcda);
        if (res.data.monteCarlo) setMonteCarloResults(res.data.monteCarlo);
      }
      return res.data;
    } catch (err) {
      console.error('AI analysis failed:', err);
      throw err;
    } finally {
      setAiLoading(false);
    }
  };

  const runSimulations = async (id, iterations = 1000, volatility = 0.15) => {
    try {
      const decision = decisions.find(d => d.id === id);
      const res = await api.post('/decisions/simulate', { decision, iterations, volatility });
      if (res.data.success) {
        setMcdaResults(res.data.mcda);
        setMonteCarloResults(res.data.monteCarlo);
        setSensitivityResults(res.data.sensitivity);
      }
      return res.data;
    } catch (err) {
      console.error('Simulation failed:', err);
      throw err;
    }
  };

  return (
    <DecisionContext.Provider value={{
      decisions,
      activeDecision,
      mcdaResults,
      monteCarloResults,
      sensitivityResults,
      aiAnalysis,
      loading,
      aiLoading,
      error,
      fetchDecisions,
      fetchDecisionById,
      createDecision,
      updateDecision,
      deleteDecision,
      parseScenarioText,
      generateAIAnalysis,
      runSimulations,
      setActiveDecision
    }}>
      {children}
    </DecisionContext.Provider>
  );
};

export const useDecision = () => useContext(DecisionContext);
