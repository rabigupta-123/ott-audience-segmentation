import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutDashboard, Users, UserCheck, BarChart3, Activity, Layers, Sparkles, X } from 'lucide-react';

export default function CommandPalette({ isOpen, onClose, setActiveTab, onSelectDemo }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose(!isOpen);
      }
      if (e.key === 'Escape' && isOpen) {
        onClose(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    { label: 'Go to Dashboard', tab: 'dashboard', icon: LayoutDashboard, category: 'Navigation' },
    { label: 'Go to Audience Segments & PCA', tab: 'segments', icon: Users, category: 'Navigation' },
    { label: 'Go to User Analyzer & Simulator', tab: 'analyzer', icon: UserCheck, category: 'Navigation' },
    { label: 'Go to Model Evaluation & Model Card', tab: 'evaluation', icon: BarChart3, category: 'Navigation' },
    { label: 'Go to System Health', tab: 'health', icon: Activity, category: 'Navigation' },
    { label: 'Go to System Architecture', tab: 'architecture', icon: Layers, category: 'Navigation' },
    { label: 'Demo Profile: Binge Action Viewer', demoIdx: 0, icon: Sparkles, category: 'Demo Profiles' },
    { label: 'Demo Profile: Casual Comedy Viewer', demoIdx: 1, icon: Sparkles, category: 'Demo Profiles' },
    { label: 'Demo Profile: Genre Explorer', demoIdx: 2, icon: Sparkles, category: 'Demo Profiles' },
    { label: 'Demo Profile: Low-Activity At-Risk', demoIdx: 3, icon: Sparkles, category: 'Demo Profiles' },
  ];

  const filtered = actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (item) => {
    if (item.tab) {
      setActiveTab(item.tab);
    } else if (item.demoIdx !== undefined && onSelectDemo) {
      setActiveTab('analyzer');
      onSelectDemo(item.demoIdx);
    }
    onClose(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/40 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="w-full max-w-xl floating-card rounded-3xl p-4 space-y-3 relative overflow-hidden shadow-2xl bg-white border border-slate-200"
        >
          <div className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-slate-50 border border-slate-200">
            <Search className="w-4 h-4 text-indigo-600 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Type a command or search demo profiles... (Esc to close)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-900 focus:outline-none font-sans"
            />
            <button onClick={() => onClose(false)} className="text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto space-y-1">
            {filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600">
                      {item.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    {item.category}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
