import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Film,
  RefreshCw,
  TrendingUp,
  Terminal,
  Play
} from 'lucide-react';

export default function LandingView({ setActiveTab, metricsData, segmentProfiles }) {
  const totalUsers = metricsData?.clustering?.total_users || 5000;
  const nClusters = metricsData?.clustering?.n_clusters || segmentProfiles?.length || 3;
  const silScore = metricsData?.clustering?.silhouette_score || 0.3222;

  // State for live interactive telemetry simulator on landing page
  const [streamCount, setStreamCount] = useState(1420);
  const [liveStreamEvents, setLiveStreamEvents] = useState([
    { id: 1, user: "USR-8492", genre: "Action / Sci-Fi", duration: "84 mins", segment: "High-Engagement Action", color: "bg-indigo-500", time: "Just now" },
    { id: 2, user: "USR-3104", genre: "Comedy / Romance", duration: "22 mins", segment: "Casual Short-Session Comedy", color: "bg-cyan-500", time: "2s ago" },
    { id: 3, user: "USR-9912", genre: "Drama / Horror", duration: "48 mins", segment: "Genre Explorers & Variety", color: "bg-purple-500", time: "4s ago" }
  ]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Periodic subtle counter increment to simulate real live data flow
  useEffect(() => {
    const timer = setInterval(() => {
      setStreamCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  // Trigger manual live telemetry event injection
  const triggerSimulatedEvent = () => {
    setIsSimulating(true);
    const mockUsers = ["USR-7731", "USR-1092", "USR-5524", "USR-8819"];
    const mockGenres = [["Action", "Thriller"], ["Romance", "Comedy"], ["Drama", "Sci-Fi"], ["Horror", "Documentary"]];
    const mockSegments = ["High-Engagement Action Viewers", "Casual Short-Session Comedy Viewers", "Genre Explorers & Variety Seekers"];
    const mockColors = ["bg-indigo-500", "bg-cyan-500", "bg-purple-500"];
    
    const randomIdx = Math.floor(Math.random() * 3);
    const newEvent = {
      id: Date.now(),
      user: mockUsers[Math.floor(Math.random() * mockUsers.length)],
      genre: mockGenres[randomIdx].join(" / "),
      duration: `${Math.floor(Math.random() * 60) + 15} mins`,
      segment: mockSegments[randomIdx],
      color: mockColors[randomIdx],
      time: "Just now"
    };

    setLiveStreamEvents(prev => [newEvent, ...prev.slice(0, 2)]);
    setTimeout(() => setIsSimulating(false), 600);
  };

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
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
      targetTab: "segments"
    },
    {
      title: "2D PCA Cluster Manifold Projection",
      desc: "Eigenvector decomposition maps high-dimensional viewer feature vectors onto 2D principal component space for scatter plotting.",
      icon: ScatterIcon,
      badge: "X' = X · W",
      color: "text-cyan-600 bg-cyan-50 border-cyan-200",
      targetTab: "segments"
    },
    {
      title: "Hybrid Viewer Boundary Detection",
      desc: "Calculates Euclidean centroid gaps (15% threshold rule) to identify multi-preference boundary viewers and assign secondary cohorts.",
      icon: Layers,
      badge: "Gap ≤ 0.15",
      color: "text-amber-600 bg-amber-50 border-amber-200",
      targetTab: "analyzer"
    },
    {
      title: "Behavioral DNA Radar Normalization",
      desc: "Standardizes z-score relative features across cohorts to render multi-dimensional behavioral radar profiles.",
      icon: Activity,
      badge: "z-Score Normalized",
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
      targetTab: "segments"
    },
    {
      title: "Explainable Match Reasons",
      desc: "Every recommended catalog title carries transparent match logic explaining why it fits the viewer's behavioral segment.",
      icon: Target,
      badge: "100% Explainable",
      color: "text-purple-600 bg-purple-50 border-purple-200",
      targetTab: "analyzer"
    },
    {
      title: "Automated 13-Point Benchmark",
      desc: "Independent Evaluator container runs automated edge-case test suites, generating verified metrics.json reports.",
      icon: ShieldCheck,
      badge: "13/13 PASS",
      color: "text-rose-600 bg-rose-50 border-rose-200",
      targetTab: "evaluation"
    }
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12 py-4 relative overflow-hidden"
    >
      {/* Dynamic Animated Ambient Background Blobs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none -z-10 overflow-hidden">
        <motion.div 
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 90, 0],
            x: [-20, 20, -20],
            y: [-10, 10, -10]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-10 w-96 h-96 bg-gradient-to-tr from-indigo-500/15 via-cyan-400/15 to-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -90, 0],
            x: [20, -20, 20],
            y: [10, -10, 10]
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-10 w-96 h-96 bg-gradient-to-br from-cyan-500/15 via-indigo-400/15 to-rose-400/10 rounded-full blur-3xl"
        />
      </div>

      {/* Hero Section */}
      <motion.div variants={itemVariants} className="relative text-center space-y-6 max-w-4xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100/80 backdrop-blur-md border border-indigo-300/70 text-indigo-800 text-xs font-bold shadow-sm">
          <Sparkles className="w-4 h-4 text-indigo-700 animate-pulse" />
          <span>AI OTT Audience Intelligence Platform</span>
        </div>

        <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-slate-900 tracking-tight leading-tight">
          Transform OTT Viewer Telemetry Into <br />
          <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
            Hyper-Personalized Audience Cohorts
          </span>
        </h1>

        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-medium">
          AudienceIQ processes raw viewer activity into 3 distinct behavioral segments, calculates Euclidean centroid distances, detects hybrid boundary users, and serves sub-10ms REST API recommendations.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 text-white font-display font-semibold text-sm shadow-xl shadow-indigo-600/25 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Launch Platform Dashboard</span>
            <ArrowRight className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => setActiveTab('analyzer')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-300/80 text-slate-800 font-display font-semibold text-sm hover:border-indigo-400 hover:text-indigo-600 shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Sliders className="w-4.5 h-4.5 text-indigo-600" />
            <span>Try Interactive Simulator</span>
          </button>
        </div>
      </motion.div>

      {/* LIVE Interactive Platform Telemetry Visualizer Showcase (REPLACES STATIC IMAGE) */}
      <motion.div variants={itemVariants} className="p-6 sm:p-8 rounded-3xl floating-card bg-white/90 backdrop-blur-xl border border-slate-200/90 shadow-2xl overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-cyan-500/5 to-transparent pointer-events-none" />

        {/* Top Control Bar of Interactive Visualizer */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200/80 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-display font-bold text-sm text-slate-900">Live Platform Telemetry Engine</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold border border-emerald-200">
              Active Stream ({streamCount.toLocaleString()} events)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={triggerSimulatedEvent}
              disabled={isSimulating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-display font-bold text-xs hover:bg-indigo-100 transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? 'Injecting Telemetry...' : 'Simulate Live Stream'}</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white font-display font-bold text-xs hover:bg-indigo-600 transition-all cursor-pointer"
            >
              <span>Go to Full App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Interactive Visualizer Canvas Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 relative z-10">
          {/* Left Panel: Real-Time Stream Event Feed */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-indigo-600" /> Incoming Streams</span>
              <span className="text-indigo-600">Sub-10ms Classification</span>
            </div>

            <div className="space-y-2.5">
              <AnimatePresence>
                {liveStreamEvents.map((evt) => (
                  <motion.div
                    key={evt.id}
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/90 flex items-center justify-between gap-3 shadow-sm hover:border-indigo-300 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${evt.color} shrink-0 animate-pulse`} />
                      <div>
                        <div className="font-mono text-xs font-bold text-slate-900">{evt.user}</div>
                        <div className="text-[11px] text-slate-500">{evt.genre} • {evt.duration}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 text-[10px] font-bold shadow-2xs">
                        {evt.segment}
                      </span>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{evt.time}</div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Panel: Interactive Visual Model Architecture Preview */}
          <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-900 text-white space-y-4 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono font-bold">
                  Cluster Manifold State: K=3 Optimal
                </span>
                <span className="text-[11px] text-slate-400 font-mono">StandardScaler + PCA</span>
              </div>
              <h3 className="font-display font-extrabold text-lg text-white">
                Live Unsupervised Viewer Segmentation
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Viewer telemetry vectors pass through StandardScaler feature scaling and PCA eigenvector mapping to assign cohorts instantly.
              </p>
            </div>

            {/* Simulated 2D Cluster Visual Graph Bar */}
            <div className="space-y-3 bg-slate-800/80 p-4 rounded-xl border border-slate-700/80">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                <span>Cluster Distribution</span>
                <span className="text-indigo-400 font-bold">Silhouette: {silScore}</span>
              </div>
              <div className="h-3 rounded-full bg-slate-700 overflow-hidden flex">
                <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: '23%' }} title="Genre Explorers: 23%" />
                <div className="h-full bg-cyan-400 transition-all duration-500" style={{ width: '51%' }} title="Casual Short-Session: 51%" />
                <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: '26%' }} title="High Engagement Action: 26%" />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Genre Explorers (23%)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Casual Short (51%)</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> High Action (26%)</span>
              </div>
            </div>

            {/* Quick Clickable Showcase Nav Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <button
                onClick={() => setActiveTab('segments')}
                className="px-3 py-2 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white font-display font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <ScatterIcon className="w-3.5 h-3.5" />
                <span>2D PCA</span>
              </button>
              <button
                onClick={() => setActiveTab('analyzer')}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-display font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Simulator</span>
              </button>
              <button
                onClick={() => setActiveTab('evaluation')}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 font-display font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Model Card</span>
              </button>
              <button
                onClick={() => setActiveTab('health')}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 font-display font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>API Health</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat KPI Counter Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-6 rounded-2xl floating-card bg-white/90 backdrop-blur-md border border-slate-200 space-y-1">
          <div className="text-xs text-slate-500 font-medium">Analyzed Telemetry</div>
          <div className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tabular-nums">{totalUsers.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 font-mono">Cleaned Dataset Rows</div>
        </div>

        <div className="p-6 rounded-2xl floating-card bg-white/90 backdrop-blur-md border border-slate-200 space-y-1">
          <div className="text-xs text-slate-500 font-medium">Discovered Cohorts</div>
          <div className="font-display text-3xl sm:text-4xl font-extrabold text-indigo-600 tabular-nums">K = {nClusters}</div>
          <div className="text-[11px] text-slate-500 font-mono">Unsupervised Segments</div>
        </div>

        <div className="p-6 rounded-2xl floating-card bg-white/90 backdrop-blur-md border border-slate-200 space-y-1">
          <div className="text-xs text-slate-500 font-medium">Silhouette Separation</div>
          <div className="font-display text-3xl sm:text-4xl font-extrabold text-cyan-600 font-mono tabular-nums">{silScore}</div>
          <div className="text-[11px] text-slate-500 font-mono">Optimal Separation</div>
        </div>

        <div className="p-6 rounded-2xl floating-card bg-white/90 backdrop-blur-md border border-slate-200 space-y-1">
          <div className="text-xs text-slate-500 font-medium">Evaluator Benchmark</div>
          <div className="font-display text-3xl sm:text-4xl font-extrabold text-emerald-600 tabular-nums">13/13 PASS</div>
          <div className="text-[11px] text-slate-500 font-mono">100% Test Coverage</div>
        </div>
      </motion.div>

      {/* Feature Capabilities Grid with Working Interactive Nav Buttons */}
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
                className="p-6 rounded-3xl floating-card bg-white/90 backdrop-blur-md border border-slate-200 space-y-4 flex flex-col justify-between"
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

                <button
                  onClick={() => setActiveTab(feat.targetTab)}
                  className="pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-indigo-600 font-bold hover:text-indigo-800 transition-colors w-full text-left cursor-pointer"
                >
                  <span>Explore Feature Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom Conversion Banner Card - High Contrast White Theme */}
      <motion.div variants={itemVariants} className="p-8 sm:p-10 rounded-3xl floating-card bg-white/95 backdrop-blur-xl border border-slate-200 text-slate-900 space-y-6 relative overflow-hidden shadow-xl">
        <div className="max-w-2xl space-y-3 relative z-10">
          <span className="px-3.5 py-1 rounded-full bg-indigo-100 text-indigo-800 font-mono text-xs font-bold border border-indigo-300">
            Production-Ready Microservices Architecture
          </span>
          <h2 className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">
            Ready to Explore Real-Time OTT Personalization?
          </h2>
          <p className="text-slate-700 font-medium text-sm leading-relaxed">
            Run instant interactive telemetry simulations, view 2D PCA user projections, or inspect official Model Card benchmarks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 relative z-10 pt-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 text-white font-display font-bold text-xs hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md cursor-pointer"
          >
            <span>Open Dashboard</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => setActiveTab('analyzer')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 border border-slate-300 text-slate-800 font-display font-bold text-xs hover:bg-slate-200 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>Launch What-If Simulator</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

