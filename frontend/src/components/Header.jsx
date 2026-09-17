import React from 'react';
import { motion } from 'framer-motion';
import { 
  PlayCircle, 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  BarChart3, 
  Activity, 
  Layers,
  Search
} from 'lucide-react';

export default function Header({ activeTab, setActiveTab, apiHealth, onOpenCommandPalette }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'segments', label: 'Audience Segments', icon: Users },
    { id: 'analyzer', label: 'User Analyzer', icon: UserCheck },
    { id: 'evaluation', label: 'Model Evaluation', icon: BarChart3 },
    { id: 'health', label: 'System Health', icon: Activity },
    { id: 'architecture', label: 'Architecture', icon: Layers },
  ];

  return (
    <header className="sticky top-4 z-50 px-4 sm:px-8 max-w-7xl mx-auto w-full mb-6">
      <div className="floating-nav rounded-2xl p-2.5 px-4 flex items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <PlayCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-base text-slate-900 tracking-tight leading-none flex items-center gap-2">
              AudienceIQ
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5 hidden sm:block">AI OTT Personalization</p>
          </div>
        </div>

        {/* Floating Navigation Pill Strip */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 z-10 ${
                  isActive ? 'text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg shadow-md shadow-indigo-600/30 -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Command Palette Trigger & Readiness Indicator */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-mono transition-all"
          >
            <Search className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Search</span>
            <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-bold text-slate-600">⌘K</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono">
            <div className={`w-2 h-2 rounded-full ${apiHealth?.model_loaded ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-slate-600 font-medium hidden sm:inline">Model:</span>
            <span className={`font-bold ${apiHealth?.model_loaded ? 'text-emerald-700' : 'text-amber-700'}`}>
              {apiHealth?.model_loaded ? `Loaded (K=${apiHealth?.n_clusters || 3})` : 'Standby'}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      <div className="md:hidden flex items-center justify-between gap-1 overflow-x-auto p-1.5 mt-2 rounded-xl bg-white border border-slate-200 scrollbar-none shadow-sm">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 flex items-center gap-1.5 ${
                isActive ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-600'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
