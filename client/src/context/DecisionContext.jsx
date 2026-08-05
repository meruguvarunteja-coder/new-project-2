import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

const DecisionContext = createContext();

export const DecisionProvider = ({ children }) => {
  const [decisions, setDecisions] = useState([]);
  const [activeDecision, setActiveDecision] = useState(null);
  const [mcdaResults, setMcdaResults] = useState(null);
  const [monteCarloResults, setMonteCarloResults] = useState(null);
  const [sensitivityResults, setSensitivityResults] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDecisions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/decisions');
      if (res.data.success) {
        setDecisions(res.data.decisions);
      }
    } catch (err) {
      console.error('Fetch decisions failed:', err);
      setError('Failed to load decision scenarios');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDecisionById = useCallback(async (id) => {
    try {
      setLoading(true);
      const res = await api.get(`/decisions/${id}`);
      if (res.data.success) {
        setActiveDecision(res.data.decision);
        setMcdaResults(res.data.mcda);
        setMonteCarloResults(res.data.monteCarlo);
        setSensitivityResults(res.data.sensitivity);
      }
      return res.data;
    } catch (err) {
      console.error('Fetch decision failed:', err);
      setError('Failed to load decision details');
    } finally {
      setLoading(false);
    }
  }, []);

  const createDecision = async (decisionData) => {
    try {
      setLoading(true);
      const res = await api.post('/decisions', decisionData);
      if (res.data.success) {
        setDecisions(prev => [res.data.decision, ...prev]);
        setActiveDecision(res.data.decision);
        setMcdaResults(res.data.mcda);
      }
      return res.data;
    } catch (err) {
      console.error('Create decision failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateDecision = async (id, updateData) => {
    try {
      const res = await api.put(`/decisions/${id}`, updateData);
      if (res.data.success) {
        setActiveDecision(res.data.decision);
        setMcdaResults(res.data.mcda);
        setDecisions(prev => prev.map(d => d.id === id ? { ...d, ...res.data.decision } : d));
      }
      return res.data;
    } catch (err) {
      console.error('Update decision failed:', err);
      throw err;
    }
  };

  const parseScenarioText = async (prompt) => {
    try {
      setAiLoading(true);
      const res = await api.post('/ai/parse-scenario', { prompt });
      return res.data;
    } catch (err) {
      console.error('AI Scenario parsing failed:', err);
      throw err;
    } finally {
      setAiLoading(false);
    }
  };

  const generateAIAnalysis = async (decisionId, decisionData = null) => {
    try {
      setAiLoading(true);
      const res = await api.post('/ai/analyze-decision', { decisionId, decisionData });
      if (res.data.success) {
        setAiAnalysis(res.data.analysis);
        if (res.data.mcda) setMcdaResults(res.data.mcda);
        if (res.data.monteCarlo) setMonteCarloResults(res.data.monteCarlo);
      }
      return res.data;
    } catch (err) {
      console.error('AI analysis generation failed:', err);
      throw err;
    } finally {
      setAiLoading(false);
    }
  };

  const runSimulations = async (id, iterations = 1000, volatility = 0.15) => {
    try {
      const res = await api.post(`/decisions/${id}/simulate`, { iterations, volatility });
      if (res.data.success) {
        setMcdaResults(res.data.mcda);
        setMonteCarloResults(res.data.monteCarlo);
        setSensitivityResults(res.data.sensitivity);
      }
      return res.data;
    } catch (err) {
      console.error('Simulation run failed:', err);
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
