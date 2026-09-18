import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  PlayCircle, 
  Users, 
  PieChart as PieIcon, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  Target, 
  ScatterChart as ScatterIcon, 
  Layers, 
  CheckCircle2,
  Activity,
  BarChart3,
  Sliders,
  Film
} from 'lucide-react';

export default function LandingView({ setActiveTab, metricsData, segmentProfiles }) {
  const totalUsers = metricsData?.clustering?.total_users || 5000;
  const nClusters = metricsData?.clustering?.n_clusters || segmentProfiles?.length || 3;
  const silScore = metricsData?.clustering?.silhouette_score || 0.3222;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
  };

  const featureCards = [
    {
      title: "Unsupervised Behavioral Clustering",
      desc: "Automatically groups OTT telemetry streams into distinct viewer cohorts using deterministic StandardScaler & K-Means clustering.",
      icon: PieIcon,
      badge: "K=3 Selected",
      color: "text-indigo-600 bg-indigo-50 border-indigo-200"
    },
    {
      title: "2D PCA Cluster Manifold Projection",
      desc: "Eigenvector decomposition maps high-dimensional viewer feature vectors onto 2D principal component space for scatter plotting.",
      icon: ScatterIcon,
      badge: "X' = X · W",
      color: "text-cyan-600 bg-cyan-50 border-cyan-200"
    },
    {
      title: "Hybrid Viewer Boundary Detection",
      desc: "Calculates Euclidean centroid gaps (15% threshold rule) to identify multi-preference boundary viewers and assign secondary cohorts.",
      icon: Layers,
      badge: "Gap ≤ 0.15",
      color: "text-amber-600 bg-amber-50 border-amber-200"
    },
    {
      title: "Behavioral DNA Radar Normalization",
      desc: "Standardizes z-score relative features across cohorts to render multi-dimensional behavioral radar profiles.",
      icon: Activity,
      badge: "z-Score Normalized",
      color: "text-emerald-600 bg-emerald-50 border-emerald-200"
    },
    {
      title: "Explainable Match Reasons",
      desc: "Every recommended catalog title carries transparent match logic explaining why it fits the viewer's behavioral segment.",
      icon: Target,
      badge: "100% Explainable",
      color: "text-purple-600 bg-purple-50 border-purple-200"
    },
    {
      title: "Automated 13-Point Benchmark",
      desc: "Independent Evaluator container runs automated edge-case test suites, generating verified metrics.json reports.",
      icon: ShieldCheck,
      badge: "13/13 PASS",
      color: "text-rose-600 bg-rose-50 border-rose-200"
    }
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12 py-4"
    >
      {/* Hero Section */}
      <motion.div variants={itemVariants} className="relative text-center space-y-6 max-w-4xl mx-auto pt-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold shadow-sm">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>UI/UX Pro Max Engine • Containerized AI Personalization</span>
        </div>

        <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-slate-900 tracking-tight leading-none">
          Transform OTT Viewer Telemetry Into <br />
          <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
            Hyper-Personalized Audience Cohorts
          </span>
        </h1>

        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          AudienceIQ processes raw viewer activity into 3 distinct behavioral segments, calculates Euclidean centroid distances, detects hybrid boundary users, and serves sub-10ms REST API recommendations.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 text-white font-display font-semibold text-sm shadow-xl shadow-indigo-600/25 hover:opacity-95 transition-all"
          >
            <span>Launch Platform Dashboard</span>
            <ArrowRight className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => setActiveTab('analyzer')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-800 font-display font-semibold text-sm hover:border-slate-300 shadow-sm transition-all"
          >
            <Sliders className="w-4.5 h-4.5 text-indigo-600" />
            <span>Try Interactive Simulator</span>
          </button>
        </div>
      </motion.div>

      {/* Hero Product Banner Graphic Card */}
      <motion.div variants={itemVariants} className="p-4 sm:p-6 rounded-3xl floating-card bg-white border border-slate-200 shadow-xl overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-cyan-500/5 to-transparent pointer-events-none" />
        <img 
          src="/hero_banner.jpg" 
          alt="AudienceIQ AI OTT Audience Segmentation Platform" 
          className="w-full h-auto rounded-2xl object-cover shadow-sm border border-slate-200/80"
        />
      </motion.div>

      {/* Stat KPI Counter Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-6 rounded-2xl floating-card bg-white border border-slate-200 space-y-1">
          <div className="text-xs text-slate-500 font-medium">Analyzed Telemetry</div>
          <div className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tabular-nums">{totalUsers.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 font-mono">Cleaned Dataset Rows</div>
        </div>

        <div className="p-6 rounded-2xl floating-card bg-white border border-slate-200 space-y-1">
          <div className="text-xs text-slate-500 font-medium">Discovered Cohorts</div>
          <div className="font-display text-3xl sm:text-4xl font-extrabold text-indigo-600 tabular-nums">K = {nClusters}</div>
          <div className="text-[11px] text-slate-500 font-mono">Unsupervised Segments</div>
        </div>

        <div className="p-6 rounded-2xl floating-card bg-white border border-slate-200 space-y-1">
          <div className="text-xs text-slate-500 font-medium">Silhouette Separation</div>
          <div className="font-display text-3xl sm:text-4xl font-extrabold text-cyan-600 font-mono tabular-nums">{silScore}</div>
          <div className="text-[11px] text-slate-500 font-mono">Optimal Separation</div>
        </div>

        <div className="p-6 rounded-2xl floating-card bg-white border border-slate-200 space-y-1">
          <div className="text-xs text-slate-500 font-medium">Evaluator Benchmark</div>
          <div className="font-display text-3xl sm:text-4xl font-extrabold text-emerald-600 tabular-nums">13/13 PASS</div>
          <div className="text-[11px] text-slate-500 font-mono">100% Test Coverage</div>
        </div>
      </motion.div>

      {/* Feature Capabilities Grid */}
      <div className="space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Production-Grade ML Capabilities
          </h2>
          <p className="text-slate-600 text-sm">
            Powered by deterministic mathematical formulas, microservice isolation, and live FastAPI REST endpoints.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div 
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="p-6 rounded-3xl floating-card bg-white border border-slate-200 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${feat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px] font-bold">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-lg text-slate-900">{feat.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-1 text-xs text-indigo-600 font-semibold cursor-pointer" onClick={() => setActiveTab('segments')}>
                  <span>Explore Feature Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom Conversion Banner Card */}
      <motion.div variants={itemVariants} className="p-8 sm:p-10 rounded-3xl floating-card bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white space-y-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl space-y-3 relative z-10">
          <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold border border-indigo-500/30">
            Hackathon & Production Ready
          </span>
          <h2 className="font-display text-3xl font-extrabold tracking-tight">
            Ready to Explore Real-Time OTT Personalization?
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Run instant interactive telemetry simulations, view 2D PCA user projections, or inspect official Model Card benchmarks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 relative z-10 pt-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-900 font-display font-bold text-xs hover:bg-slate-100 transition-all shadow-lg"
          >
            <span>Open Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('analyzer')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-700/60 border border-indigo-500/40 text-white font-display font-bold text-xs hover:bg-indigo-700 transition-all"
          >
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Launch What-If Simulator</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
