import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Brain, LayoutDashboard, PlusCircle, LogOut, User, Sparkles, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Brain className="w-5 h-5 text-cyan-400 animate-pulse-slow" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-xl tracking-tight text-white">OmniDecision</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" /> AI 2.5
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block -mt-1 font-medium">Decision Intelligence Engine</span>
          </div>
        </Link>

        {/* Center Nav Links */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/60">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/dashboard')
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Workspace
            </Link>
            <Link
              to="/new-decision"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/new-decision')
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-cyan-400" /> New Decision
            </Link>
          </div>
        )}

        {/* User / Auth Info */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="text-left">
                  <span className="text-xs font-semibold text-white block leading-none">{user?.name}</span>
                  <span className="text-[10px] text-slate-400 block leading-tight">{user?.role || 'Strategist'}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
