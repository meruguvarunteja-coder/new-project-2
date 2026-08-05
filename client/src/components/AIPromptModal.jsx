import React, { useState } from 'react';
import { Sparkles, X, Loader2, Lightbulb, FileText, ArrowRight } from 'lucide-react';

const DEMO_PROMPTS = [
  "Evaluate migrating our core data pipeline and LLM infrastructure from AWS to GCP Vertex AI vs. hosting open-source models on RunPod Kubernetes. Consider cost, latency SLA, team ramp-up, and lock-in risk.",
  "Evaluate enterprise HR expansion: Hire 10 full-time engineers in LATAM vs. partner with an IT Staffing agency vs. automate with internal AI workflow agents.",
  "Capital allocation decision: Reinvest $5M into Core SaaS product feature velocity vs. launch new B2B Enterprise Compliance suite vs. acquire a competitor's customer base."
];

export default function AIPromptModal({ isOpen, onClose, onGenerated }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    try {
      setLoading(true);
      setError(null);
      await onGenerated(prompt);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to parse scenario with Gemini AI');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-0.5">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-display font-bold text-white">AI Scenario Generator (Gemini Powered)</h3>
            <p className="text-xs text-slate-400">Describe your strategic decision in plain text. AI will parse criteria, options & weights.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-400" /> Scenario Description / Problem Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., We are deciding whether to build our recommendation engine in-house, acquire an existing startup, or use AWS Personalize..."
              rows={4}
              className="w-full rounded-xl glass-input p-3 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 border border-slate-700/60"
            />
          </div>

          <div>
            <span className="text-xs font-medium text-slate-400 block mb-2 flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Or try one of these strategic examples:
            </span>
            <div className="space-y-2">
              {DEMO_PROMPTS.map((demo, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPrompt(demo)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-800/40 text-xs text-slate-300 transition-all duration-200"
                >
                  {demo}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50 transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" /> Extracting Scenario...
                </>
              ) : (
                <>
                  Generate Decision Matrix <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
