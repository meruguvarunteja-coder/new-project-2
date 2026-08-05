import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDecision } from '../context/DecisionContext';
import { Sparkles, Layers, ArrowRight, Plus, Trash2, HelpCircle } from 'lucide-react';
import AIPromptModal from '../components/AIPromptModal';

export default function NewDecision() {
  const { createDecision, parseScenarioText } = useDecision();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [industry, setIndustry] = useState('Technology & SaaS');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [criteria, setCriteria] = useState([
    { id: 'crit_cost', name: 'Total Cost of Ownership', weight: 0.35, type: 'cost', unit: 'USD' },
    { id: 'crit_impact', name: 'Strategic Business Impact', weight: 0.35, type: 'benefit', unit: 'Score' },
    { id: 'crit_risk', name: 'Risk & Failure Exposure', weight: 0.30, type: 'benefit', unit: 'Score' }
  ]);

  const [options, setOptions] = useState([
    { id: 'opt_1', name: 'Option Alpha (In-House Build)', description: 'Develop custom internal solution', scores: { crit_cost: 6, crit_impact: 9, crit_risk: 7 }, risks: ['Dev timeline slip'] },
    { id: 'opt_2', name: 'Option Beta (Vendor SaaS)', description: 'License enterprise turnkey solution', scores: { crit_cost: 8, crit_impact: 7, crit_risk: 8 }, risks: ['Recurring subscription fees'] }
  ]);

  const handleAiGenerated = async (prompt) => {
    const parsed = await parseScenarioText(prompt);
    if (parsed && parsed.data) {
      const created = await createDecision(parsed.data);
      if (created && created.decision) {
        navigate(`/studio/${created.decision.id}`);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setLoading(true);
      const created = await createDecision({
        title,
        problemStatement,
        industry,
        criteria,
        options
      });
      if (created && created.decision) {
        navigate(`/studio/${created.decision.id}`);
      }
    } catch (err) {
      console.error('Failed to create decision:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-slate-800 flex items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Strategic Matrix Setup
          </span>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight">Create Decision Scenario</h1>
          <p className="text-xs text-slate-400">Define criteria and alternatives or let Gemini AI parse your problem text.</p>
        </div>

        <button
          onClick={() => setIsAiModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 shrink-0 hover:from-indigo-500 hover:to-cyan-400 transition-all"
        >
          <Sparkles className="w-4 h-4 text-cyan-300" /> Auto-Parse with AI
        </button>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Decision Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Core Database Architecture Migration"
              className="w-full p-3 rounded-xl glass-input text-sm text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Industry Sector</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full p-3 rounded-xl glass-input text-sm text-white bg-slate-900"
            >
              <option value="Technology & SaaS">Technology & SaaS</option>
              <option value="Financial Services">Financial Services</option>
              <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
              <option value="Supply Chain & Logistics">Supply Chain & Logistics</option>
              <option value="Executive Capital Allocation">Executive Capital Allocation</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">Problem Statement & Key Constraints</label>
          <textarea
            rows={3}
            value={problemStatement}
            onChange={(e) => setProblemStatement(e.target.value)}
            placeholder="Describe the trade-offs, timelines, budget limits, or operational goals..."
            className="w-full p-3 rounded-xl glass-input text-sm text-white"
          />
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-slate-800">
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
          >
            Create Decision Studio <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      <AIPromptModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onGenerated={handleAiGenerated}
      />
    </div>
  );
}
