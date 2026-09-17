import React from 'react';
import { Cpu, HardDrive, CheckCircle2, AlertTriangle, Layers, BookOpen, Clock, ShieldCheck } from 'lucide-react';

export default function ModelCard({ metricsData }) {
  const featuresList = [
    { name: "watch_time_hours", desc: "Total cumulative watch hours logged across platform sessions." },
    { name: "avg_session_mins", desc: "Mean viewing session duration in minutes." },
    { name: "total_sessions", desc: "Frequency count of distinct viewing sessions." },
    { name: "weekday_watch_ratio", desc: "Ratio [0.0 - 1.0] of viewing activity occurring on weekdays vs weekends." },
    { name: "recency_days", desc: "Elapsed days since last recorded viewer interaction." },
    { name: "short_session_ratio", desc: "Ratio [0.0 - 1.0] of sessions under 20 minutes duration." },
    { name: "genre_diversity", desc: "Count of distinct catalog genres interacted with." },
    { name: "one_hot_genres (9 vector dims)", desc: "Binary indicators across Action, Comedy, Drama, Thriller, Sci-Fi, Romance, Documentary, Animation, Horror." }
  ];

  const experiments = [
    { k: 2, sil: 0.3169, boot: "0.3177 ± 0.0028", inertia: 53709 },
    { k: 3, sil: 0.3324, boot: "0.3332 ± 0.0013", inertia: 44463, selected: true },
    { k: 4, sil: 0.3150, boot: "0.3137 ± 0.0041", inertia: 36642 },
    { k: 5, sil: 0.3204, boot: "0.3040 ± 0.0174", inertia: 33517 },
    { k: 6, sil: 0.2680, boot: "0.2905 ± 0.0040", inertia: 31653 },
    { k: 7, sil: 0.2948, boot: "0.2820 ± 0.0198", inertia: 29217 },
    { k: 8, sil: 0.2966, boot: "0.2777 ± 0.0272", inertia: 27892 }
  ];

  return (
    <div className="space-y-6">
      {/* Model Overview Header Card */}
      <div className="p-6 rounded-3xl floating-card space-y-4 bg-white border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h3 className="font-display font-bold text-slate-900 text-lg">AudienceIQ Official Model Card</h3>
          </div>
          <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-mono text-xs font-semibold border border-indigo-200">
            Model Spec v1.0
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-500 font-mono uppercase">Algorithm</div>
            <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">StandardScaler + KMeans</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-500 font-mono uppercase">Dataset Rows</div>
            <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">5,000 raw / 5,000 cleaned</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-500 font-mono uppercase">Random Seed</div>
            <div className="text-sm font-bold text-emerald-700 font-mono mt-0.5">42 (Fully Reproducible)</div>
          </div>
        </div>
      </div>

      {/* Feature Schema Table */}
      <div className="p-6 rounded-3xl floating-card space-y-4 bg-white border border-slate-200">
        <h4 className="font-display font-semibold text-slate-900 text-base">Engineered Feature Schema</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-600 font-mono uppercase text-[10px]">
              <tr>
                <th className="p-3 rounded-l-xl">Feature Name</th>
                <th className="p-3 rounded-r-xl">Behavioral Interpretation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {featuresList.map((f, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-indigo-700">{f.name}</td>
                  <td className="p-3 text-slate-700">{f.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid Search & Bootstrap Stability Evidence Table */}
      <div className="p-6 rounded-3xl floating-card space-y-4 bg-white border border-slate-200">
        <h4 className="font-display font-semibold text-slate-900 text-base">K Selection Evidence & Bootstrap Stability Analysis</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-600 font-mono uppercase text-[10px]">
              <tr>
                <th className="p-3 rounded-l-xl">Candidate K</th>
                <th className="p-3">Silhouette Score</th>
                <th className="p-3">Bootstrap Mean ± Std (N=10)</th>
                <th className="p-3">Inertia</th>
                <th className="p-3 rounded-r-xl text-right">Selection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {experiments.map((e, i) => (
                <tr key={i} className={e.selected ? "bg-indigo-50 font-bold" : "hover:bg-slate-50"}>
                  <td className="p-3 font-mono text-slate-900">K = {e.k}</td>
                  <td className="p-3 font-mono text-indigo-700">{e.sil}</td>
                  <td className="p-3 font-mono text-cyan-700">{e.boot}</td>
                  <td className="p-3 font-mono text-slate-600">{e.inertia}</td>
                  <td className="p-3 text-right">
                    {e.selected ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-mono font-bold">
                        ★ OPTIMAL SELECTION
                      </span>
                    ) : (
                      <span className="text-slate-500 font-mono text-[10px]">Candidate</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assumptions & Known Limitations Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-6 rounded-3xl floating-card space-y-3 bg-white border border-slate-200">
          <div className="flex items-center gap-2 text-indigo-700 font-display font-semibold text-sm">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            Preprocessing Assumptions
          </div>
          <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
            <li>Deduplicated by unique <code className="text-slate-800 font-semibold font-mono">user_id</code>.</li>
            <li>Missing numerical values filled deterministically using feature median.</li>
            <li>Impossible negative inputs (e.g. negative watch hours) clipped to zero.</li>
            <li>Ratios (weekday, short-session) bounded $[0.0, 1.0]$.</li>
          </ul>
        </div>

        <div className="p-6 rounded-3xl floating-card space-y-3 bg-white border border-slate-200">
          <div className="flex items-center gap-2 text-amber-700 font-display font-semibold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Known Model Limitations
          </div>
          <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside leading-relaxed">
            <li>Assumes stationary viewing behavior over historical evaluation window.</li>
            <li>Static feature vectors without real-time sequential temporal modeling.</li>
            <li>Euclidean metric sensitive to extreme tail outliers without standard scaling.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
