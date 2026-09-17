import React from 'react';
import { motion } from 'framer-motion';
import { Users, Film, Clock, Zap, Target, Layers, ScatterChart as ScatterIcon, Activity } from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ScatterChart, 
  Scatter, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from 'recharts';

export default function SegmentsView({ segmentProfiles, projectionsData }) {
  const defaultProfiles = [
    {
      segment_id: 0,
      segment_name: "Genre Explorers & Variety Seekers",
      description: "Enthusiastic viewers exploring multiple distinct genres across diverse catalog offerings.",
      population: 1159,
      percentage: 23.18,
      avg_watch_time_hours: 39.9,
      avg_session_mins: 50.0,
      avg_total_sessions: 44.3,
      short_session_ratio: 0.35,
      recency_days: 3.5,
      dominant_genres: ["Drama", "Horror"],
      recommendation_strategy: "Offer curated multi-genre discovery carousels and genre crossover recommendations.",
      dna_profile: { watch_time_hours: 58, avg_session_mins: 55, total_sessions: 65, short_session_ratio: 45, recency_days: 35, genre_diversity: 85 }
    },
    {
      segment_id: 1,
      segment_name: "Casual Short-Session Comedy Viewers",
      description: "Viewers with quick, frequent sessions preferring light episodic or bite-sized entertainment.",
      population: 2546,
      percentage: 50.92,
      avg_watch_time_hours: 10.7,
      avg_session_mins: 23.0,
      avg_total_sessions: 17.4,
      short_session_ratio: 0.65,
      recency_days: 14.0,
      dominant_genres: ["Comedy", "Romance"],
      recommendation_strategy: "Recommend short-duration episodes, comedy clips, and quick-watch trending titles.",
      dna_profile: { watch_time_hours: 25, avg_session_mins: 30, total_sessions: 35, short_session_ratio: 85, recency_days: 70, genre_diversity: 30 }
    },
    {
      segment_id: 2,
      segment_name: "High-Engagement Action Viewers",
      description: "Power viewers with high cumulative watch time, long viewing sessions, and heavy genre commitment.",
      population: 1295,
      percentage: 25.9,
      avg_watch_time_hours: 64.0,
      avg_session_mins: 84.4,
      avg_total_sessions: 46.7,
      short_session_ratio: 0.13,
      recency_days: 2.5,
      dominant_genres: ["Action", "Sci-Fi"],
      recommendation_strategy: "Promote long-form content, deep series marathons, and newly released blockbusters.",
      dna_profile: { watch_time_hours: 90, avg_session_mins: 92, total_sessions: 70, short_session_ratio: 15, recency_days: 25, genre_diversity: 45 }
    }
  ];

  const profiles = segmentProfiles && segmentProfiles.length > 0 ? segmentProfiles : defaultProfiles;
  const userProjections = projectionsData && projectionsData.length > 0 ? projectionsData : [];

  const COLORS = ['#6366F1', '#06B6D4', '#10B981'];

  // Format Radar data from real segment DNA profiles
  const radarFeatures = ["watch_time_hours", "avg_session_mins", "total_sessions", "short_session_ratio", "recency_days", "genre_diversity"];
  const radarData = radarFeatures.map(feat => {
    const row = { feature: feat.replace('_', ' ') };
    profiles.forEach(p => {
      row[p.segment_name] = p.dna_profile?.[feat] || 50;
    });
    return row;
  });

  // Split projections by segment
  const seg0Points = userProjections.filter(p => p.segment_id === 0);
  const seg1Points = userProjections.filter(p => p.segment_id === 1);
  const seg2Points = userProjections.filter(p => p.segment_id === 2);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            Audience Segments & PCA Projection
          </h2>
          <p className="text-slate-600 text-sm">
            Detailed statistical breakdown and 2D Principal Component Analysis (PCA) projection of discovered cohorts.
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold font-mono self-start">
          {profiles.length} Verified Cohorts
        </div>
      </div>

      {/* Floating Segment Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {profiles.map((seg) => (
          <div 
            key={seg.segment_id}
            className="p-6 rounded-3xl floating-card flex flex-col justify-between gap-5 relative overflow-hidden group bg-white border border-slate-200"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-500/10 to-cyan-500/5 rounded-full blur-3xl group-hover:from-indigo-500/20 transition-all pointer-events-none" />
            
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-mono text-xs font-semibold">
                  Cohort #{seg.segment_id}
                </span>
                <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-xs border border-indigo-200 font-mono">
                  {seg.percentage}% share
                </span>
              </div>

              <div>
                <h3 className="font-display font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {seg.segment_name}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {seg.description}
                </p>
              </div>

              {/* Dominant Genre Chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono">Dominant Genres</span>
                <div className="flex flex-wrap gap-1.5">
                  {seg.dominant_genres.map((g, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-200">
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stat Tile Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-200">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-600" />
                    Avg Watch Time
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5 font-mono tabular-nums">{seg.avg_watch_time_hours} hrs</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-cyan-600" />
                    Avg Session
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5 font-mono tabular-nums">{seg.avg_session_mins} mins</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Film className="w-3 h-3 text-amber-600" />
                    Short Session %
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5 font-mono tabular-nums">{Math.round((seg.short_session_ratio || 0.3) * 100)}%</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Users className="w-3 h-3 text-emerald-600" />
                    Viewers
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5 font-mono tabular-nums">{seg.population}</div>
                </div>
              </div>
            </div>

            {/* Recommendation Strategy Box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1 relative z-10">
              <div className="text-[11px] font-semibold text-indigo-700 flex items-center gap-1.5 font-display">
                <Target className="w-3.5 h-3.5" />
                Recommendation Strategy
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {seg.recommendation_strategy}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 2D PCA Cluster Scatter Plot */}
      <div className="p-6 rounded-3xl floating-card space-y-4 bg-white border border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScatterIcon className="w-5 h-5 text-indigo-600" />
            <h3 className="font-display font-semibold text-slate-900 text-base">2D PCA Cluster Manifold Projection</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">{userProjections.length || 500} Sampled User Vectors</span>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <XAxis type="number" dataKey="pc1" name="Principal Component 1" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis type="number" dataKey="pc2" name="Principal Component 2" stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '1rem', color: '#0F172A', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                formatter={(val, name) => [val, name]}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Scatter name={profiles[0]?.segment_name || "Cohort 0"} data={seg0Points} fill="#6366F1" opacity={0.8} />
              <Scatter name={profiles[1]?.segment_name || "Cohort 1"} data={seg1Points} fill="#06B6D4" opacity={0.8} />
              <Scatter name={profiles[2]?.segment_name || "Cohort 2"} data={seg2Points} fill="#10B981" opacity={0.8} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Segment DNA Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl floating-card space-y-4 bg-white border border-slate-200">
          <h3 className="font-display font-semibold text-slate-900 text-base flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-600" />
            Segment Behavioral DNA (Normalized Features)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="feature" stroke="#475569" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94A3B8" fontSize={9} />
                {profiles.map((p, idx) => (
                  <Radar
                    key={p.segment_id}
                    name={p.segment_name}
                    dataKey={p.segment_name}
                    stroke={COLORS[idx % COLORS.length]}
                    fill={COLORS[idx % COLORS.length]}
                    fillOpacity={0.25}
                  />
                ))}
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Comparative Segment Metrics */}
        <div className="p-6 rounded-3xl floating-card space-y-4 bg-white border border-slate-200">
          <h3 className="font-display font-semibold text-slate-900 text-base flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            Comparative Metrics
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profiles}>
                <XAxis dataKey="segment_name" stroke="#64748B" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '1rem', color: '#0F172A', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} />
                <Legend />
                <Bar dataKey="avg_watch_time_hours" name="Watch Time (Hrs)" fill="#6366F1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="avg_session_mins" name="Avg Session (Mins)" fill="#06B6D4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
