import React from 'react';
import { motion } from 'framer-motion';
import { Layers, CheckCircle2, Cpu, Server, HardDrive, Layout, ShieldCheck } from 'lucide-react';

export default function ArchitectureView() {
  const stackItems = [
    { title: "Machine Learning", tech: "Scikit-Learn (KMeans, StandardScaler), Pandas, NumPy, Joblib" },
    { title: "Backend REST API", tech: "Python 3.11, FastAPI, Pydantic v2, Uvicorn, Requests" },
    { title: "Automated Evaluator", tech: "Pytest, Requests, TestClient, Custom JSON Exporter" },
    { title: "Web Platform", tech: "React 18, Vite, Framer Motion, Tailwind CSS, Recharts, Lucide Icons" },
    { title: "Deployment & Infra", tech: "Docker, Docker Compose, Shared Model Volume, Healthchecks" }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Layers className="w-6 h-6 text-indigo-600" />
          System Architecture & Technical Design
        </h2>
        <p className="text-slate-600 text-sm">
          Technical specifications of AudienceIQ containerized machine learning architecture.
        </p>
      </div>

      {/* Visual Workflow Block */}
      <div className="p-7 rounded-3xl floating-card space-y-6 bg-white border border-slate-200">
        <h3 className="font-display font-semibold text-slate-900 text-base">Container Topology & Workflow</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 relative">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold font-mono text-xs border border-indigo-200">
              1
            </div>
            <h4 className="font-display font-bold text-sm text-slate-900">TRAINER</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Cleans telemetry, evaluates K=2..8 grid search, fits optimal KMeans, and exports joblib to shared volume.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 relative">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold font-mono text-xs border border-cyan-200">
              2
            </div>
            <h4 className="font-display font-bold text-sm text-slate-900">SHARED VOLUME</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Persists <code className="text-cyan-800 font-semibold font-mono">audience_pipeline.joblib</code> and <code className="text-cyan-800 font-semibold font-mono">segment_metadata.json</code>.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 relative">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold font-mono text-xs border border-emerald-200">
              3
            </div>
            <h4 className="font-display font-bold text-sm text-slate-900">FASTAPI REST API</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Loads persisted model on startup, serves <code className="text-emerald-800 font-semibold font-mono">/health</code> & <code className="text-emerald-800 font-semibold font-mono">/recommend</code>.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 relative">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold font-mono text-xs border border-amber-200">
              4
            </div>
            <h4 className="font-display font-bold text-sm text-slate-900">EVALUATOR & UI</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Evaluator tests 13 edge cases, outputs <code className="text-amber-800 font-semibold font-mono">metrics.json</code>. React Floating Glass UI displays live metrics.
            </p>
          </div>
        </div>
      </div>

      {/* Tech Stack Specification Card */}
      <div className="p-7 rounded-3xl floating-card space-y-4 bg-white border border-slate-200">
        <h3 className="font-display font-semibold text-slate-900 text-base">Technology Stack Specification</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {stackItems.map((item, idx) => (
            <div key={idx} className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold font-display text-slate-900">{item.title}</div>
                <div className="text-xs text-slate-600 mt-0.5 font-mono">{item.tech}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
