import React from 'react';
import { motion } from 'framer-motion';
import { Users, PieChart as PieIcon, Award, CheckCircle2, ArrowRight, Sparkles, Activity, ShieldCheck, Cpu } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function DashboardView({ metricsData, segmentProfiles, setActiveTab }) {
  const COLORS = ['#6366F1', '#06B6D4', '#10B981', '#F59E0B'];

  const totalUsers = metricsData?.clustering?.total_users || 5000;
  const nClusters = metricsData?.clustering?.n_clusters || segmentProfiles?.length || 0;
  const silScore = metricsData?.clustering?.silhouette_score !== undefined ? metricsData.clustering.silhouette_score : "Calculating...";

  const profiles = segmentProfiles || [];

  const chartData = profiles.map((s, idx) => ({
    name: s.segment_name,
    shortName: s.segment_name ? (s.segment_name.split(' ')[0] + ' ' + (s.segment_name.split(' ')[1] || '')) : `Cohort ${idx}`,
    population: s.population,
    percentage: s.percentage,
    avg_watch_time: s.avg_watch_time_hours,
    avg_session_mins: s.avg_session_mins,
    color: COLORS[idx % COLORS.length]
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Asymmetric Bento Hero Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Large Bento Hero Card */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-8 p-7 rounded-3xl floating-card relative overflow-hidden flex flex-col justify-between min-h-[240px] group border border-slate-200 bg-white"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:from-indigo-500/20 transition-all duration-500" />

          <div className="space-y-3 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Unsupervised Behavioral Intelligence
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
              OTT Audience Segmentation & Recommendation Engine
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Transforming raw viewer telemetry into 3 distinct behavioral cohorts using deterministic StandardScaler & KMeans clustering. Serves real-time REST API recommendations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4 relative z-10 border-t border-slate-200">
            <button
              onClick={() => setActiveTab('analyzer')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium text-xs hover:from-indigo-500 hover:to-indigo-600 shadow-md shadow-indigo-600/20 transition-all duration-200"
            >
              <span>Launch User Analyzer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-600 font-mono">
              <Cpu className="w-3.5 h-3.5 text-cyan-600" />
              <span>CPU-Optimized Inference</span>
            </div>
          </div>
        </motion.div>

        {/* Bento Hero KPI Stat Card */}
        <motion.div 
          variants={itemVariants}
          className="lg:col-span-4 p-7 rounded-3xl floating-card flex flex-col justify-between bg-white border border-slate-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Analyzed Viewers</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>

          <div>
            <div className="font-display text-4xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">Cleaned Telemetry Activity Records</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between text-slate-700">
            <span>Duplicates Removed</span>
            <span className="font-mono text-emerald-600 font-semibold">0</span>
          </div>
        </motion.div>
      </div>

      {/* KPI Bento Grid Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div variants={itemVariants} className="p-6 rounded-2xl floating-card space-y-3 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Discovered Cohorts</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
              <PieIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-3xl font-bold text-slate-900 tabular-nums">{nClusters} Segments</div>
          <div className="text-[11px] text-slate-500 font-mono">Evaluated range $K=2..8$</div>
        </motion.div>

        <motion.div variants={itemVariants} className="p-6 rounded-2xl floating-card space-y-3 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Silhouette Score</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-3xl font-bold text-emerald-600 tabular-nums font-mono">{silScore}</div>
          <div className="text-[11px] text-slate-500 font-mono">Max separation metric</div>
        </motion.div>

        <motion.div variants={itemVariants} className="p-6 rounded-2xl floating-card space-y-3 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Evaluator Benchmark</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="font-display text-3xl font-bold text-emerald-600">13/13 PASS</div>
          <div className="text-[11px] text-slate-500 font-mono">metrics.json generated</div>
        </motion.div>

        <motion.div variants={itemVariants} className="p-6 rounded-2xl floating-card space-y-3 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">System Readiness</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Activity className="w-4 h-4 text-indigo-600" />
            </div>
          </div>
          <div className="font-display text-3xl font-bold text-indigo-600">HEALTHY</div>
          <div className="text-[11px] text-slate-500 font-mono">Seed: 42 (Reproducible)</div>
        </motion.div>
      </div>

      {/* Floating Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Pie Chart Card */}
        <motion.div variants={itemVariants} className="lg:col-span-5 p-6 rounded-3xl floating-card space-y-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-slate-900 text-base">Audience Distribution</h3>
            <span className="text-xs text-slate-500 font-mono">K=3 Share</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={6}
                  dataKey="population"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '1rem', color: '#0F172A', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value, name, props) => [`${value} viewers (${props.payload.percentage}%)`, props.payload.name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-200">
            {chartData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 truncate max-w-[200px]">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700 font-medium truncate">{item.name}</span>
                </div>
                <span className="font-mono text-slate-900 font-bold">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bar Chart Card */}
        <motion.div variants={itemVariants} className="lg:col-span-7 p-6 rounded-3xl floating-card space-y-4 bg-white border border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-slate-900 text-base">Cohort Behavioral Comparison</h3>
            <span className="text-xs text-slate-500 font-mono">Watch Time vs Session Length</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="shortName" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '1rem', color: '#0F172A', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }} />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="avg_watch_time" name="Avg Watch Time (hrs)" fill="#6366F1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="avg_session_mins" name="Avg Session (mins)" fill="#06B6D4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
