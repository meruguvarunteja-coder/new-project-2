import React from 'react';
import { Sliders, Plus, Trash2, ShieldAlert, Award, ChevronRight } from 'lucide-react';

export default function DecisionMatrix({ decision, onChange, mcdaResults }) {
  if (!decision) return null;

  const handleWeightChange = (critId, newWeight) => {
    const updatedCriteria = decision.criteria.map(c =>
      c.id === critId ? { ...c, weight: parseFloat(newWeight) } : c
    );
    onChange({ ...decision, criteria: updatedCriteria });
  };

  const handleScoreChange = (optId, critId, newScore) => {
    const val = Math.max(1, Math.min(10, parseFloat(newScore) || 5));
    const updatedOptions = decision.options.map(o => {
      if (o.id === optId) {
        return {
          ...o,
          scores: { ...(o.scores || {}), [critId]: val }
        };
      }
      return o;
    });
    onChange({ ...decision, options: updatedOptions });
  };

  const handleAddCriterion = () => {
    const newId = 'crit_' + Date.now().toString().slice(-4);
    const newCrit = { id: newId, name: 'New Criterion', weight: 0.15, type: 'benefit', unit: 'Score' };
    const updatedCriteria = [...decision.criteria, newCrit];
    onChange({ ...decision, criteria: updatedCriteria });
  };

  const handleRemoveCriterion = (critId) => {
    if (decision.criteria.length <= 1) return;
    const updatedCriteria = decision.criteria.filter(c => c.id !== critId);
    onChange({ ...decision, criteria: updatedCriteria });
  };

  const handleAddOption = () => {
    const newId = 'opt_' + Date.now().toString().slice(-4);
    const defaultScores = {};
    decision.criteria.forEach(c => defaultScores[c.id] = 6.0);
    const newOpt = {
      id: newId,
      name: 'New Strategic Option',
      description: 'Custom option alternative',
      scores: defaultScores,
      risks: ['Initial execution risk']
    };
    onChange({ ...decision, options: [...decision.options, newOpt] });
  };

  const handleRemoveOption = (optId) => {
    if (decision.options.length <= 1) return;
    onChange({ ...decision, options: decision.options.filter(o => o.id !== optId) });
  };

  const normalizedWeights = mcdaResults?.normalizedWeights || {};
  const rankings = mcdaResults?.rankings || [];

  return (
    <div className="space-y-6">
      {/* Criteria Weight Sliders */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-display font-semibold text-white">Decision Criteria & Importance Weights</h3>
          </div>
          <button
            onClick={handleAddCriterion}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 text-xs font-semibold border border-indigo-500/30 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Criterion
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {decision.criteria.map(crit => {
            const normPercent = Math.round((normalizedWeights[crit.id] || 0) * 100);
            return (
              <div key={crit.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{crit.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {normPercent}% weight
                    </span>
                    <button
                      onClick={() => handleRemoveCriterion(crit.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors"
                      title="Remove Criterion"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1.0"
                  step="0.05"
                  value={crit.weight || 0.1}
                  onChange={(e) => handleWeightChange(crit.id, e.target.value)}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* MCDA Matrix Grid Table */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-display font-semibold text-white">Options & Evaluation Scoring Matrix</h3>
            <p className="text-xs text-slate-400">Score each option from 1.0 (Poor) to 10.0 (Excellent) across criteria</p>
          </div>
          <button
            onClick={handleAddOption}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600/30 text-xs font-semibold border border-cyan-500/30 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Option
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80">
                <th className="py-3 px-4 font-semibold text-slate-300 min-w-[180px]">Option / Alternative</th>
                {decision.criteria.map(crit => (
                  <th key={crit.id} className="py-3 px-3 font-semibold text-slate-300 text-center min-w-[120px]">
                    <div>{crit.name}</div>
                    <div className="text-[10px] text-slate-500 font-normal">
                      ({Math.round((normalizedWeights[crit.id] || 0) * 100)}%)
                    </div>
                  </th>
                ))}
                <th className="py-3 px-4 font-semibold text-indigo-400 text-center min-w-[120px]">Composite Score</th>
                <th className="py-3 px-2 text-center w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {decision.options.map(opt => {
                const ranking = rankings.find(r => r.optionId === opt.id);
                const isTop = ranking?.rank === 1;

                return (
                  <tr
                    key={opt.id}
                    className={`transition-colors hover:bg-slate-800/30 ${
                      isTop ? 'bg-indigo-950/20 border-l-2 border-indigo-500' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-medium text-white">
                      <div className="flex items-center gap-2">
                        {isTop && <Award className="w-4 h-4 text-amber-400 shrink-0" />}
                        <div>
                          <div className="font-semibold text-sm text-slate-100">{opt.name}</div>
                          {opt.description && <div className="text-[11px] text-slate-400 line-clamp-1">{opt.description}</div>}
                        </div>
                      </div>
                    </td>

                    {decision.criteria.map(crit => {
                      const scoreVal = opt.scores?.[crit.id] ?? 5;
                      return (
                        <td key={crit.id} className="py-3 px-3 text-center">
                          <input
                            type="number"
                            min="1"
                            max="10"
                            step="0.5"
                            value={scoreVal}
                            onChange={(e) => handleScoreChange(opt.id, crit.id, e.target.value)}
                            className="w-16 text-center py-1 rounded-lg glass-input text-xs font-bold text-white focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                      );
                    })}

                    <td className="py-3.5 px-4 text-center font-bold">
                      <div className="inline-flex flex-col items-center">
                        <span className={`text-sm px-2.5 py-0.5 rounded-full ${
                          isTop
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/20'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {ranking ? ranking.compositeScore.toFixed(2) : '-'} / 10
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">Rank #{ranking?.rank || '-'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-2 text-center">
                      <button
                        onClick={() => handleRemoveOption(opt.id)}
                        className="text-slate-600 hover:text-rose-400 transition-colors p-1"
                        title="Delete Option"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
