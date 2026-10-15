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
  Search,
  Sparkles,
  BookOpen,
  ShieldAlert
} from 'lucide-react';

export default function Header({ activeTab, setActiveTab, apiHealth, onOpenCommandPalette }) {
  const navItems = [
    { id: 'landing', label: 'Overview', icon: Sparkles },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'segments', label: 'Segments', icon: Users },
    { id: 'analyzer', label: 'Analyzer', icon: UserCheck },
    { id: 'retention', label: 'Retention', icon: ShieldAlert },
    { id: 'evaluation', label: 'Evaluation', icon: BarChart3 },
    { id: 'health', label: 'Health', icon: Activity },
    { id: 'architecture', label: 'Architecture', icon: Layers },
    { id: 'about', label: 'About', icon: BookOpen },
  ];

  return (
    <header className="sticky top-2 z-50 px-3 sm:px-5 md:px-6 max-w-7xl mx-auto w-full mb-2 shrink-0 compact-header">
      <div className="floating-nav rounded-2xl p-2 px-3.5 flex items-center justify-between gap-2.5">
        {/* Logo & Title */}
        <div className="flex items-center gap-2.5 shrink-0 cursor-pointer" onClick={() => setActiveTab('landing')}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-md shadow-indigo-600/30 shrink-0">
            <PlayCircle className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="shrink-0">
            <h1 className="font-display font-bold text-sm sm:text-base text-slate-900 tracking-tight leading-none flex items-center gap-1.5 whitespace-nowrap">
              AudienceIQ
            </h1>
            <p className="text-[10px] text-slate-500 mt-0.5 hidden sm:block whitespace-nowrap">AI OTT Analytics</p>
          </div>
        </div>

        {/* Floating Navigation Pill Strip (Managed, Non-wrapping, Compact) */}
        <nav className="hidden lg:flex items-center gap-0.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200/90 shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 z-10 whitespace-nowrap shrink-0 ${
                  isActive ? 'text-white font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg shadow-sm shadow-indigo-600/30 -z-10"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Medium-screen scrollable nav for 768px-1024px */}
        <nav className="hidden md:flex lg:hidden items-center gap-0.5 bg-slate-100/90 p-1 rounded-xl border border-slate-200/90 overflow-x-auto scrollbar-none max-w-md">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1 shrink-0 whitespace-nowrap ${
                  isActive ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Command Palette Trigger & Readiness Indicator (Always Fully Visible) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-mono transition-all whitespace-nowrap shrink-0"
          >
            <Search className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="hidden sm:inline">Search</span>
            <span className="px-1 py-0.2 rounded bg-white border border-slate-200 text-[10px] font-bold text-slate-600">⌘K</span>
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono whitespace-nowrap shrink-0">
            <div className={`w-2 h-2 rounded-full shrink-0 ${apiHealth?.model_loaded ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-slate-600 font-medium hidden sm:inline">Model:</span>
            <span className={`font-bold ${apiHealth?.model_loaded ? 'text-emerald-700' : 'text-amber-700'}`}>
              {apiHealth?.model_loaded ? `Loaded (K=${apiHealth?.n_clusters || 3})` : 'Standby'}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown Strip */}
      <div className="md:hidden flex items-center gap-1 overflow-x-auto p-1 mt-1.5 rounded-xl bg-white border border-slate-200 scrollbar-none shadow-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 flex items-center gap-1 whitespace-nowrap ${
                isActive ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-600'
              }`}
            >
              <Icon className="w-3 h-3 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
