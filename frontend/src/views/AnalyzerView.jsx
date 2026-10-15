import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCheck, 
  Sparkles, 
  Send, 
  Film, 
  Clock, 
  AlertCircle, 
  Play, 
  Layers, 
  Sliders, 
  RefreshCw,
  Star,
  ChevronDown,
  ShieldAlert
} from 'lucide-react';

export default function AnalyzerView({ apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api', selectedDemoIdx = null }) {
  const [formData, setFormData] = useState({
    user_id: 'USR-8192',
    watch_time_hours: 65.0,
    avg_session_mins: 85.0,
    total_sessions: 45,
    top_genres: ['Action', 'Sci-Fi'],
    weekday_watch_ratio: 0.7,
    recency_days: 2.0,
    short_session_ratio: 0.1,
    limit: 12
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [liveSimulatorActive, setLiveSimulatorActive] = useState(true);

  const abortControllerRef = useRef(null);

  const genresPool = [
    "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
    "Drama", "Family", "Fantasy", "Film-Noir", "Horror", "Musical",
    "Mystery", "Romance", "Sci-Fi", "Thriller", "War", "Western"
  ];

  const demoUsers = [
    {
      label: "Demo 01: Binge Action",
      desc: "High watch time, long sessions",
      data: {
        user_id: "DEMO-01",
        watch_time_hours: 75.0,
        avg_session_mins: 90.0,
        total_sessions: 55,
        top_genres: ["Action", "Sci-Fi"],
        weekday_watch_ratio: 0.75,
        recency_days: 1.0,
        short_session_ratio: 0.08,
        limit: 12
      }
    },
    {
      label: "Demo 02: Casual Comedy",
      desc: "Short sessions, light episodic",
      data: {
        user_id: "DEMO-02",
        watch_time_hours: 9.5,
        avg_session_mins: 22.0,
        total_sessions: 28,
        top_genres: ["Comedy", "Romance"],
        weekday_watch_ratio: 0.40,
        recency_days: 5.0,
        short_session_ratio: 0.75,
        limit: 12
      }
    },
    {
      label: "Demo 03: Hybrid Boundary",
      desc: "Boundary profile (Action + Comedy)",
      data: {
        user_id: "DEMO-HYBRID",
        watch_time_hours: 28.0,
        avg_session_mins: 42.0,
        total_sessions: 25,
        top_genres: ["Action", "Comedy"],
        weekday_watch_ratio: 0.50,
        recency_days: 4.0,
        short_session_ratio: 0.35,
        limit: 12
      }
    },
    {
      label: "Demo 04: Low Activity",
      desc: "Low watch time, high recency gap",
      data: {
        user_id: "DEMO-04",
        watch_time_hours: 3.0,
        avg_session_mins: 18.0,
        total_sessions: 4,
        top_genres: ["Drama"],
        weekday_watch_ratio: 0.30,
        recency_days: 25.0,
        short_session_ratio: 0.60,
        limit: 12
      }
    }
  ];

  const handleAnalyze = async (dataToSubmit = formData) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      let response;
      try {
        response = await fetch(`${apiBaseUrl}/recommend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSubmit),
          signal: controller.signal
        });
      } catch (err) {
        if (err.name === 'AbortError') return;
        response = await fetch('http://localhost:8000/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSubmit),
          signal: controller.signal
        });
      }

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.message || `API Error HTTP ${response.status}`);
      }

      const resData = await response.json();
      setResult(resData);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to communicate with recommendation API.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Debounced auto-execution for Live "What-If" Simulator (~450ms)
  useEffect(() => {
    if (!liveSimulatorActive) return;

    const timer = setTimeout(() => {
      handleAnalyze(formData);
    }, 450);

    return () => clearTimeout(timer);
  }, [
    formData.watch_time_hours, 
    formData.avg_session_mins, 
    formData.short_session_ratio, 
    formData.recency_days, 
    formData.top_genres, 
    formData.limit,
    liveSimulatorActive
  ]);

  // Handle demo user selection from Command Palette
  useEffect(() => {
    if (selectedDemoIdx !== null && demoUsers[selectedDemoIdx]) {
      loadDemoUser(demoUsers[selectedDemoIdx].data);
    }
  }, [selectedDemoIdx]);

  const toggleGenre = (genre) => {
    setFormData(prev => {
      const exists = prev.top_genres.includes(genre);
      const newGenres = exists 
        ? prev.top_genres.filter(g => g !== genre)
        : [...prev.top_genres, genre];
      return { ...prev, top_genres: newGenres };
    });
  };

  const loadDemoUser = (demoData) => {
    setFormData(demoData);
    handleAnalyze(demoData);
  };

  // Strictly sort recommendations from top rating to low rating (5 to 1, top rating at high)
  const sortedRecommendations = [...(result?.recommendations || [])].sort((a, b) => {
    const hasA = a.rating !== null && a.rating !== undefined;
    const hasB = b.rating !== null && b.rating !== undefined;
    if (hasA && !hasB) return -1;
    if (!hasA && hasB) return 1;
    if (!hasA && !hasB) return 0;
    if (b.rating !== a.rating) {
      return b.rating - a.rating; // Descending: 5.0 down to 1.0
    }
    return (b.weighted_rating || 0) - (a.weighted_rating || 0);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-3 pt-0.5"
    >
      {/* View Header (Compact for screen-fit) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-600" />
              Live User Cohort Analyzer & Recommendation Engine
            </h2>
            <span className="hidden md:inline px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-mono font-semibold">
              Fit-To-Screen Mode
            </span>
          </div>
          <p className="text-slate-600 text-xs mt-0.5">
            Simulate telemetry in real-time. Recommendations scroll internally with ratings ordered from top (5) to low (1).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <span className="text-[11px] text-slate-500 font-mono">Live Simulator:</span>
          <button 
            onClick={() => setLiveSimulatorActive(!liveSimulatorActive)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono border transition-all ${
              liveSimulatorActive 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs' 
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {liveSimulatorActive ? '● AUTO ON' : '○ MANUAL'}
          </button>
        </div>
      </div>

      {/* Floating Demo Presets Strip (Compact single-line height) */}
      <div className="p-2.5 px-3.5 rounded-2xl floating-card bg-white border border-slate-200 flex flex-col md:flex-row md:items-center gap-2 justify-between">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1 shrink-0">
          <Sparkles className="w-3 h-3 text-indigo-600" />
          Presets:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
          {demoUsers.map((demo, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.015, translateY: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => loadDemoUser(demo.data)}
              className="p-1.5 px-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-300 text-left transition-all duration-150 group flex items-center justify-between"
            >
              <div className="truncate pr-1">
                <div className="text-[11px] font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                  {demo.label}
                </div>
                <div className="text-[9px] text-slate-500 truncate">{demo.data.watch_time_hours}h • {demo.data.avg_session_mins}m</div>
              </div>
              <Play className="w-2.5 h-2.5 fill-indigo-600 text-indigo-600 shrink-0 opacity-60 group-hover:opacity-100" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        {/* Input Form & Live Sliders Floating Card (Compact) */}
        <div className="lg:col-span-4 p-3.5 sm:p-4 rounded-2xl floating-card space-y-3 bg-white border border-slate-200 self-start">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="font-display font-semibold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              Telemetry Simulator Controls
            </h3>
            {loading && (
              <span className="flex items-center gap-1 text-[10px] text-indigo-600 font-mono font-semibold">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Inferring...
              </span>
            )}
          </div>

          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-0.5 font-mono">
                <span>User Identifier</span>
                <span className="text-slate-400 font-mono text-[10px]">ID</span>
              </div>
              <input
                type="text"
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                className="w-full px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-[11px] focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            {/* Slider 1: Watch Time */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-0.5 font-mono">
                <span>Watch Time</span>
                <span className="text-indigo-600 font-bold">{formData.watch_time_hours} hrs</span>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                step="1"
                value={formData.watch_time_hours}
                onChange={(e) => setFormData({ ...formData, watch_time_hours: parseFloat(e.target.value) })}
                className="w-full accent-indigo-600 bg-slate-100 rounded-lg cursor-pointer h-1.5"
              />
            </div>

            {/* Slider 2: Avg Session */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-0.5 font-mono">
                <span>Avg Session</span>
                <span className="text-cyan-700 font-bold">{formData.avg_session_mins} mins</span>
              </div>
              <input
                type="range"
                min="5"
                max="150"
                step="1"
                value={formData.avg_session_mins}
                onChange={(e) => setFormData({ ...formData, avg_session_mins: parseFloat(e.target.value) })}
                className="w-full accent-cyan-600 bg-slate-100 rounded-lg cursor-pointer h-1.5"
              />
            </div>

            {/* Slider 3: Short Session Ratio */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-0.5 font-mono">
                <span>Short Ratio (&lt;20m)</span>
                <span className="text-amber-600 font-bold">{Math.round(formData.short_session_ratio * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={formData.short_session_ratio}
                onChange={(e) => setFormData({ ...formData, short_session_ratio: parseFloat(e.target.value) })}
                className="w-full accent-amber-600 bg-slate-100 rounded-lg cursor-pointer h-1.5"
              />
            </div>

            {/* Slider 4: Recommendation Limit */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-600 mb-0.5 font-mono">
                <span>Results Limit</span>
                <span className="text-emerald-700 font-bold">{formData.limit || 12} titles</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                step="1"
                value={formData.limit || 12}
                onChange={(e) => setFormData({ ...formData, limit: parseInt(e.target.value) })}
                className="w-full accent-emerald-600 bg-slate-100 rounded-lg cursor-pointer h-1.5"
              />
            </div>

            {/* Preferred Genres Selection */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-slate-600">Preferred Real-Life Genres</label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-indigo-600 font-mono font-semibold bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-100">
                    {formData.top_genres.length} selected
                  </span>
                  {formData.top_genres.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, top_genres: [] }))}
                      className="text-[10px] text-slate-400 hover:text-rose-600 font-mono transition-colors"
                    >
                      reset
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1 scrollbar-thin">
                {genresPool.map((g) => {
                  const selected = formData.top_genres.includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGenre(g)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all ${
                        selected
                          ? 'bg-indigo-600 text-white border border-indigo-600 shadow-xs font-semibold'
                          : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAnalyze()}
              disabled={loading}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 text-white font-display font-semibold text-xs hover:opacity-95 shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Manual Re-Analyze</span>
            </motion.button>
          </div>
        </div>

        {/* Output Floating Panel */}
        <div className="lg:col-span-8 space-y-3">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <div>
                <div className="font-bold font-display">Analysis Error</div>
                <div className="text-[11px] text-rose-700">{error}</div>
              </div>
            </div>
          )}

          {!result && !error && (
            <div className="p-8 rounded-2xl floating-card bg-white border border-slate-200 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Sliders className="w-5 h-5" />
              </div>
              <div className="max-w-md space-y-0.5">
                <h4 className="font-display font-bold text-sm text-slate-900">Ready for Live Inference</h4>
                <p className="text-[11px] text-slate-500">
                  Select a Demo Preset above or drag sliders to evaluate cohort transitions live.
                </p>
              </div>
            </div>
          )}

          {result && (
            <AnimatePresence mode="wait">
              <motion.div
                key={result.segment_id + '-' + result.user_id + '-' + (result.recommendations?.length || 0)}
                initial={{ opacity: 0, scale: 0.99, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                {/* Cohort Output Header Card (Compact) */}
                <div className="p-3.5 px-4 rounded-2xl floating-card bg-white border border-slate-200 space-y-2 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-200 pb-2">
                    <div>
                      <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider font-mono">
                        Assigned Cohort #{result.segment_id}
                      </span>
                      <h3 className="font-display text-base font-bold text-slate-900 mt-0.5">
                        {result.segment_name}
                      </h3>
                    </div>

                    <div className="px-2.5 py-0.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono self-start sm:self-auto">
                      <span className="text-slate-500">Centroid Distance: </span>
                      <span className="text-cyan-700 font-bold tabular-nums">{result.distance_to_centroid}</span>
                    </div>
                  </div>

                  {/* Boundary / Secondary Segment Callout */}
                  {result.boundary_confidence_note && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-0.5">
                      <div className="font-bold font-display flex items-center gap-1.5 text-amber-700 text-[11px]">
                        <Layers className="w-3.5 h-3.5" />
                        Hybrid Tendency Detected (Boundary Viewer)
                      </div>
                      <p className="text-[11px] text-amber-800 font-sans leading-snug">
                        {result.boundary_confidence_note}
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {result.segment_description}
                  </p>

                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                    <span className="font-semibold text-indigo-600 font-display">Strategy: </span>
                    {result.recommendation_strategy}
                  </div>

                  {result.churn_risk && (
                    <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all ${
                      result.churn_risk.risk_level === 'HIGH'
                        ? 'bg-rose-50/90 border-rose-200 text-rose-900'
                        : result.churn_risk.risk_level === 'MEDIUM'
                        ? 'bg-amber-50/90 border-amber-200 text-amber-900'
                        : 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                    }`}>
                      <div className="flex items-center gap-2">
                        <ShieldAlert className={`w-4 h-4 shrink-0 ${
                          result.churn_risk.risk_level === 'HIGH' ? 'text-rose-600' : (result.churn_risk.risk_level === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600')
                        }`} />
                        <div>
                          <div className="text-[11px] font-bold font-display flex items-center gap-1.5">
                            <span>Predicted Churn Risk: {result.churn_risk.churn_risk_percentage}% ({result.churn_risk.risk_level} ATTRITION RISK)</span>
                          </div>
                          <p className="text-[10px] text-slate-600 mt-0.5 line-clamp-1">{result.churn_risk.primary_driver}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-mono font-bold bg-white/90 px-2 py-0.5 rounded-md border border-slate-200 text-slate-700">
                          {result.churn_risk.retention_playbook?.campaign_id || 'ACTIVE PLAYBOOK'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Recommendations Section with INTERNAL SCROLL AREA */}
                <div className="p-3.5 px-4 rounded-2xl floating-card bg-white border border-slate-200 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-100">
                    <h4 className="font-display font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                      <Film className="w-4 h-4 text-indigo-600" />
                      Recommended Titles ({sortedRecommendations.length} Results)
                    </h4>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="text-[10px] text-amber-800 font-mono font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1 shadow-2xs">
                        <span>★</span>
                        <span>Top Rating Out of 5 First (5.0 → 1.0)</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                        (Scroll inside ↓)
                      </span>
                    </div>
                  </div>

                  {/* Dedicated INTERNAL SCROLLING AREA (Fits within screen) */}
                  <div 
                    className="overflow-y-auto custom-scrollbar pr-1 max-h-[360px] xl:max-h-[390px]"
                    style={{ scrollbarGutter: 'stable' }}
                  >
                    <div 
                      className="grid gap-2.5 pb-1"
                      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}
                    >
                      {sortedRecommendations.map((rec, idx) => {
                        const hasRating = rec.rating !== null && rec.rating !== undefined;
                        const ratingStr = hasRating ? `★ ${Number(rec.rating).toFixed(2)}/5` : 'Not rated';
                        const votesStr = hasRating && rec.rating_count ? `(${rec.rating_count})` : '';

                        return (
                          <motion.div 
                            key={idx}
                            whileHover={{ y: -2, scale: 1.01 }}
                            className="p-3 rounded-xl floating-card space-y-2 relative overflow-hidden bg-white border border-slate-200/90 shadow-2xs hover:border-indigo-300 transition-all flex flex-col justify-between"
                          >
                            <div className="space-y-1.5">
                              {/* Header: Badge & Top Rating First */}
                              <div className="flex items-start justify-between gap-1">
                                <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[9px] font-mono font-bold border border-indigo-200/70 truncate max-w-[95px]">
                                  {rec.badge || "RECOMMENDED"}
                                </span>

                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold shrink-0 flex items-center gap-1 ${
                                  hasRating 
                                    ? 'bg-slate-900 text-amber-300 shadow-2xs' 
                                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                                }`}>
                                  <span>{ratingStr}</span>
                                  {votesStr && <span className="text-[9px] text-slate-400 font-normal">{votesStr}</span>}
                                </span>
                              </div>

                              {/* Title & Metadata */}
                              <div>
                                <h5 className="font-display font-bold text-xs text-slate-900 leading-snug line-clamp-2" title={rec.title}>
                                  {rec.title}
                                </h5>
                                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono mt-0.5">
                                  {rec.year && <span className="font-semibold text-slate-700">{rec.year}</span>}
                                  {rec.year && <span>•</span>}
                                  <span className="flex items-center gap-0.5">
                                    <Clock className="w-2.5 h-2.5 text-slate-400" />
                                    {rec.duration_mins || rec.duration || 100}m
                                  </span>
                                </div>
                              </div>

                              {/* Genre Chips */}
                              <div className="flex flex-wrap gap-1">
                                {(rec.genres || []).slice(0, 4).map((g, gIdx) => {
                                  const isMatched = (formData.top_genres || []).some(tg => 
                                    tg.toLowerCase() === g.toLowerCase() || 
                                    (tg.toLowerCase() === 'family' && g.toLowerCase() === 'children') ||
                                    (tg.toLowerCase() === 'children' && g.toLowerCase() === 'family')
                                  );
                                  return (
                                    <span 
                                      key={gIdx}
                                      className={`px-1.5 py-0.2 rounded text-[9px] font-medium border ${
                                        isMatched
                                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold'
                                          : 'bg-slate-100 text-slate-600 border-slate-200'
                                      }`}
                                    >
                                      {g}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Reason Tag & Match Percentage */}
                            <div className="space-y-1 pt-1.5 border-t border-slate-100">
                              <div className="flex items-center justify-between text-[9px]">
                                <span className="text-slate-500 font-mono">Match Score</span>
                                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                  {rec.match_percentage || 95}% MATCH
                                </span>
                              </div>

                              {/* Reason Tags */}
                              <div className="flex flex-wrap gap-1">
                                {(rec.reasons && rec.reasons.length > 0 ? rec.reasons : [rec.match_reason || "Segment Recommended"]).map((rTag, rIdx) => (
                                  <span 
                                    key={rIdx}
                                    className="px-1.5 py-0.2 rounded bg-indigo-50/80 text-indigo-800 text-[9px] font-sans font-medium border border-indigo-100 leading-tight"
                                  >
                                    {rTag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  );
}
