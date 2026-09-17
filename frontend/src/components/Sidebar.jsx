import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  BarChart3, 
  Activity, 
  Layers 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'segments', label: 'Audience Segments', icon: Users },
    { id: 'analyzer', label: 'User Analyzer', icon: UserCheck },
    { id: 'evaluation', label: 'Model Evaluation', icon: BarChart3 },
    { id: 'health', label: 'System Health', icon: Activity },
    { id: 'architecture', label: 'Architecture & Docs', icon: Layers },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/50 p-4 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Platform Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/25'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="flex items-center justify-between text-slate-300 font-medium">
          <span>Seed Reproducibility</span>
          <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-mono text-[10px]">42</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Deterministic KMeans + StandardScaler architecture.
        </p>
      </div>
    </aside>
  );
}
