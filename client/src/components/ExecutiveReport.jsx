import React from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, DollarSign, Cpu, Users, ArrowUpRight, HelpCircle } from 'lucide-react';

export default function ExecutiveReport({ aiAnalysis, mcdaResults }) {
  if (!aiAnalysis) return null;

  const rec = aiAnalysis.recommendation || {};
  const viewpoints = aiAnalysis.multiAgentViewpoints || {};
  const rationale = aiAnalysis.rationaleBreakdown || [];
  const actionPlan = aiAnalysis.actionPlan || [];

  return (
    <div className="space-y-6">
      {/* Top Banner Recommendation Card */}
      <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/30 shadow-xl shadow-indigo-950/50">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-48 h-48 text-indigo-400" />
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Gemini AI Recommendation
              </span>
              <span className="text-xs text-slate-400">Validated by MCDA & Monte Carlo</span>
            </div>
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">
              Recommended Path: <span className="text-cyan-400">{rec.recommendedOptionName}</span>
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {rec.executiveSummary}
            </p>
          </div>

          {/* Confidence Score Badge */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-900/90 border border-indigo-500/30 min-w-[140px]">
            <span className="text-3xl font-display font-extrabold text-gradient-cyan">
              {rec.confidenceScore}%
            </span>
            <span className="text-xs font-medium text-slate-400 mt-1">AI Confidence Index</span>
          </div>
        </div>
      </div>

      {/* Rationale Breakdown & Counterfactual Reasoning */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Rationale */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-display font-semibold text-white">Strategic Rationale & Drivers</h3>
          </div>
          <ul className="space-y-3">
            {rationale.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Counterfactual Reasoning */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-display font-semibold text-white">Counterfactual Stress Conditions</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed bg-amber-500/5 p-3.5 rounded-xl border border-amber-500/20">
            {aiAnalysis.counterfactualReasoning}
          </p>
        </div>
      </div>

      {/* Multi-Agent Perspectives Grid */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Users className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-display font-semibold text-white">Multi-Agent Stakeholder Perspectives</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CFO View */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
              <DollarSign className="w-4 h-4" /> CFO Financial View
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">{viewpoints.cfoFinancial}</p>
          </div>

          {/* CTO View */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
              <Cpu className="w-4 h-4" /> CTO Technical View
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">{viewpoints.ctoTechnical}</p>
          </div>

          {/* COO View */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <Users className="w-4 h-4" /> COO Operations View
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">{viewpoints.cooOperations}</p>
          </div>

          {/* Risk View */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" /> Chief Risk Officer
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">{viewpoints.riskOfficer}</p>
          </div>
        </div>
      </div>

      {/* Action Plan */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <ArrowUpRight className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-display font-semibold text-white">Recommended Immediate Execution Steps</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {actionPlan.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                {idx + 1}
              </span>
              <span className="text-xs text-slate-300">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
