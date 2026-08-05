import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDecision } from '../context/DecisionContext';
import DecisionMatrix from '../components/DecisionMatrix';
import ExecutiveReport from '../components/ExecutiveReport';
import RadarComparison from '../components/Charts/RadarComparison';
import TradeOffFrontier from '../components/Charts/TradeOffFrontier';
import MonteCarloDistribution from '../components/Charts/MonteCarloDistribution';
import SensitivityChart from '../components/Charts/SensitivityChart';
import {
  Brain,
  Sliders,
  BarChart3,
  Sparkles,
  Save,
  Play,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  RefreshCw,
  TrendingDown,
  Percent,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function DecisionStudio() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    activeDecision,
    mcdaResults,
    monteCarloResults,
    sensitivityResults,
    aiAnalysis,
    fetchDecisionById,
    updateDecision,
    generateAIAnalysis,
    runSimulations,
    aiLoading,
    loading
  } = useDecision();

  const [activeTab, setActiveTab] = useState('matrix');
  const [editedDecision, setEditedDecision] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const [simLoading, setSimLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDecisionById(id);
    }
  }, [id, fetchDecisionById]);

  useEffect(() => {
    if (activeDecision) {
      setEditedDecision(activeDecision);
    }
  }, [activeDecision]);

  if (loading || !editedDecision) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="text-sm font-medium">Loading Decision Studio...</span>
      </div>
    );
  }

  const handleMatrixChange = (newDecision) => {
    setEditedDecision(newDecision);
  };

  const handleSave = async () => {
    try {
      setSaveStatus('saving');
      await updateDecision(id, editedDecision);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      setSaveStatus('error');
    }
  };

  const handleTriggerAISynthesis = async () => {
    try {
      await generateAIAnalysis(id, editedDecision);
      setActiveTab('report');
    } catch (err) {
      console.error('AI synthesis failed:', err);
    }
  };

  const handleRunSimulations = async () => {
    try {
      setSimLoading(true);
      await runSimulations(id, 1000, 0.15);
    } catch (err) {
      console.error('Simulations failed:', err);
    } finally {
      setSimLoading(false);
    }
  };

  const handleModifierToggle = async (key) => {
    const currentMods = editedDecision.scenarioModifiers || {};
    const updatedMods = { ...currentMods, [key]: !currentMods[key] };
    const updated = { ...editedDecision, scenarioModifiers: updatedMods };
    setEditedDecision(updated);
    await updateDecision(id, updated);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Studio Header Nav */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Workspace
            </button>
            <span className="text-slate-600">&bull;</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {editedDecision.industry || 'Enterprise'}
            </span>
          </div>

          <input
            type="text"
            value={editedDecision.title}
            onChange={(e) => setEditedDecision({ ...editedDecision, title: e.target.value })}
            className="text-2xl font-display font-extrabold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none w-full tracking-tight transition-all"
          />

          <textarea
            value={editedDecision.problemStatement || ''}
            onChange={(e) => setEditedDecision({ ...editedDecision, problemStatement: e.target.value })}
            placeholder="Add decision context and constraints..."
            rows={1}
            className="text-xs text-slate-400 bg-transparent border-none focus:outline-none w-full resize-none"
          />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleTriggerAISynthesis}
            disabled={aiLoading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 flex items-center gap-2 disabled:opacity-50 transition-all"
          >
            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-cyan-300" />}
            Generate AI Report
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Matrix'}
          </button>
        </div>
      </div>

      {/* Scenario Stress Modifiers Strip */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-white">Scenario Stress Tests & Macro Modifiers:</span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => handleModifierToggle('marketDownturn')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
              editedDecision.scenarioModifiers?.marketDownturn
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/20'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" /> Market Recession (-20% Demand)
          </button>

          <button
            onClick={() => handleModifierToggle('costInflationPercent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
              editedDecision.scenarioModifiers?.costInflationPercent
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Percent className="w-3.5 h-3.5" /> Cost Inflation (+25% Capex)
          </button>

          <button
            onClick={() => handleModifierToggle('stringentCompliance')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
              editedDecision.scenarioModifiers?.stringentCompliance
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm shadow-indigo-500/20'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Strict GDPR / SOC2 Compliance
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'matrix'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4" /> Decision Matrix & Scoring
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'analytics'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Visual Analytics & Monte Carlo
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'report'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-cyan-400" /> Gemini Explainable AI Report
        </button>
      </div>

      {/* Tab Content 1: Matrix */}
      {activeTab === 'matrix' && (
        <DecisionMatrix
          decision={editedDecision}
          onChange={handleMatrixChange}
          mcdaResults={mcdaResults}
        />
      )}

      {/* Tab Content 2: Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between glass-panel p-4 rounded-2xl border border-slate-800">
            <div>
              <h3 className="text-sm font-display font-semibold text-white">Stochastic Monte Carlo Engine</h3>
              <p className="text-xs text-slate-400">Simulates 1,000 randomized market iterations to calculate winning probability under volatility.</p>
            </div>
            <button
              onClick={handleRunSimulations}
              disabled={simLoading}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 transition-all"
            >
              {simLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              Run 1,000 Iterations
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Radar Comparison */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-semibold text-slate-300">Multi-Dimensional Profile Radar</h4>
              <RadarComparison decision={editedDecision} />
            </div>

            {/* Trade-off Pareto Frontier */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-semibold text-slate-300">Pareto Trade-off Frontier (Score vs Risk)</h4>
              <TradeOffFrontier mcdaResults={mcdaResults} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monte Carlo Probability Distribution */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-semibold text-slate-300">Monte Carlo Simulation Volatility Run</h4>
              <MonteCarloDistribution monteCarloResults={monteCarloResults} />
            </div>

            {/* Sensitivity Curves */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-semibold text-slate-300">Criteria Weight Sensitivity Analysis</h4>
              <SensitivityChart sensitivityResults={sensitivityResults} />
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: Explainable AI Report */}
      {activeTab === 'report' && (
        <div className="space-y-4">
          {!aiAnalysis ? (
            <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-4">
              <Brain className="w-12 h-12 text-cyan-400 mx-auto animate-pulse-slow" />
              <h3 className="text-lg font-semibold text-white">No AI Analysis Generated Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Click below to send your MCDA matrix and simulation data to Google Gemini for multi-agent synthesis.
              </p>
              <button
                onClick={handleTriggerAISynthesis}
                disabled={aiLoading}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 mx-auto"
              >
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Synthesize Gemini AI Report
              </button>
            </div>
          ) : (
            <ExecutiveReport aiAnalysis={aiAnalysis} mcdaResults={mcdaResults} />
          )}
        </div>
      )}
    </div>
  );
}
