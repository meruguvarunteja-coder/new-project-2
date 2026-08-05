import React from 'react';
import { Brain, ShieldCheck, Sparkles, Code, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/60 bg-slate-950/60 py-8 px-4 mt-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-slate-300">OmniDecision AI</span>
          <span>&mdash; Enterprise Decision Intelligence Solution</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Google Gemini API
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> JWT Protected
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <Code className="w-3.5 h-3.5 text-indigo-400" /> Multi-Criteria & Monte Carlo
          </span>
        </div>
      </div>
    </footer>
  );
}
