import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDecision } from '../context/DecisionContext';
import { useAuth } from '../context/AuthContext';
import {
  PlusCircle,
  Brain,
  Layers,
  Sparkles,
  Award,
  ArrowRight,
  Trash2,
  Activity,
  Sliders,
  CheckCircle2,
  Clock
} from 'lucide-react';
import AIPromptModal from '../components/AIPromptModal';

export default function Dashboard() {
  const { decisions, fetchDecisions, parseScenarioText, createDecision, loading } = useDecision();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  useEffect(() => {
    fetchDecisions();
  }, [fetchDecisions]);

  const handleAiGenerated = async (prompt) => {
    const parsed = await parseScenarioText(prompt);
    if (parsed && parsed.data) {
      const created = await createDecision(parsed.data);
      if (created && created.decision) {
        navigate(`/studio/${created.decision.id}`);
      }
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Decision Intelligence Workspace
            </span>
            <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-gradient-indigo">{user?.name || 'Strategist'}</span>
            </h1>
            <p className="text-sm text-slate-300">
              Evaluate complex multi-criteria trade-offs, run stochastic Monte Carlo simulations, and generate explainable executive recommendations powered by Google Gemini.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all duration-200"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" /> AI Scenario Generator
            </button>
            <Link
              to="/new-decision"
              className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-sm flex items-center gap-2 transition-all duration-200"
            >
              <PlusCircle className="w-4 h-4 text-slate-300" /> Manual Canvas
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Decision Models</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-display font-bold text-white">{decisions.length}</div>
          <span className="text-[11px] text-emerald-400">Active & Audited</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>AI Model Engine</span>
            <Brain className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-display font-bold text-cyan-400">Gemini 1.5</div>
          <span className="text-[11px] text-slate-400">Multi-Agent Synthesis</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Monte Carlo Iterations</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-display font-bold text-emerald-400">1,000 / run</div>
          <span className="text-[11px] text-slate-400">Stochastic Volatility Noise</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>MCDA Normalization</span>
            <Sliders className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-display font-bold text-amber-400">AHP / Weighted</div>
          <span className="text-[11px] text-slate-400">Real-time Pareto Frontier</span>
        </div>
      </div>

      {/* Decision Scenarios List Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" /> Active Strategic Decision Scenarios
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading decision workspace...</div>
        ) : decisions.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-4">
            <Brain className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-semibold text-white">No Decision Scenarios Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Create your first decision matrix or let Gemini AI automatically structure your strategic problem from plain text.
            </p>
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
            >
              Generate AI Decision Scenario
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decisions.map(d => (
              <div
                key={d.id}
                className="glass-panel glass-panel-hover p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                      {d.industry || 'Strategy'}
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(d.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-display font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {d.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {d.problemStatement || 'Multi-criteria strategic alternative analysis.'}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-800/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Leading Option:</span>
                    <span className="font-semibold text-emerald-400 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> {d.mcdaSummary?.topOption}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{d.mcdaSummary?.optionCount || 0} Alternatives</span>
                    <span>{d.mcdaSummary?.criteriaCount || 0} Criteria</span>
                  </div>

                  <Link
                    to={`/studio/${d.id}`}
                    className="w-full py-2.5 rounded-xl bg-slate-900 group-hover:bg-indigo-600 text-slate-200 group-hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all duration-200"
                  >
                    Open Decision Studio <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Scenario Modal */}
      <AIPromptModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onGenerated={handleAiGenerated}
      />
    </div>
  );
}
