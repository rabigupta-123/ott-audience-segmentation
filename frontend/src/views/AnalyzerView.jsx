import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, Sparkles, Send, Film, Clock, AlertCircle, Play, Layers, Sliders, RefreshCw } from 'lucide-react';

export default function AnalyzerView({ apiBaseUrl = 'http://localhost:8000' }) {
  const [formData, setFormData] = useState({
    user_id: 'USR-8192',
    watch_time_hours: 65.0,
    avg_session_mins: 85.0,
    total_sessions: 45,
    top_genres: ['Action', 'Sci-Fi'],
    weekday_watch_ratio: 0.7,
    recency_days: 2.0,
    short_session_ratio: 0.1
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [liveSimulatorActive, setLiveSimulatorActive] = useState(true);

  const abortControllerRef = useRef(null);

  const genresPool = ["Action", "Comedy", "Drama", "Thriller", "Sci-Fi", "Romance", "Documentary", "Animation", "Horror"];

  const demoUsers = [
    {
      label: "Demo User 01: Binge Action",
      desc: "High watch time, long sessions",
      data: {
        user_id: "DEMO-01",
        watch_time_hours: 75.0,
        avg_session_mins: 90.0,
        total_sessions: 55,
        top_genres: ["Action", "Sci-Fi"],
        weekday_watch_ratio: 0.75,
        recency_days: 1.0,
        short_session_ratio: 0.08
      }
    },
    {
      label: "Demo User 02: Casual Comedy",
      desc: "Short sessions, light episodic",
      data: {
        user_id: "DEMO-02",
        watch_time_hours: 9.5,
        avg_session_mins: 22.0,
        total_sessions: 28,
        top_genres: ["Comedy", "Romance"],
        weekday_watch_ratio: 0.40,
        recency_days: 5.0,
        short_session_ratio: 0.75
      }
    },
    {
      label: "Demo User 03: Hybrid Boundary",
      desc: "Boundary profile (Action + Comedy)",
      data: {
        user_id: "DEMO-HYBRID",
        watch_time_hours: 28.0,
        avg_session_mins: 42.0,
        total_sessions: 25,
        top_genres: ["Action", "Comedy"],
        weekday_watch_ratio: 0.50,
        recency_days: 4.0,
        short_session_ratio: 0.35
      }
    },
    {
      label: "Demo User 04: Low-Activity At-Risk",
      desc: "Low watch time, high recency gap",
      data: {
        user_id: "DEMO-04",
        watch_time_hours: 3.0,
        avg_session_mins: 18.0,
        total_sessions: 4,
        top_genres: ["Drama"],
        weekday_watch_ratio: 0.30,
        recency_days: 25.0,
        short_session_ratio: 0.60
      }
    }
  ];

  const handleAnalyze = async (dataToSubmit = formData) => {
    // Abort previous in-flight request if user is rapidly dragging sliders
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
        response = await fetch('/api/recommend', {
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

  // Debounced auto-execution for Live "What-If" Simulator
  useEffect(() => {
    if (!liveSimulatorActive) return;

    const timer = setTimeout(() => {
      handleAnalyze(formData);
    }, 450);

    return () => clearTimeout(timer);
  }, [formData.watch_time_hours, formData.avg_session_mins, formData.short_session_ratio, formData.recency_days, formData.top_genres, liveSimulatorActive]);

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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-indigo-600" />
            Interactive User Analyzer & Live "What-If" Simulator
          </h2>
          <p className="text-slate-600 text-sm">
            Drag sliders to simulate real-time viewer telemetry changes with automatic debounced API re-inference.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <span className="text-xs text-slate-500 font-mono">Live Simulator:</span>
          <button 
            onClick={() => setLiveSimulatorActive(!liveSimulatorActive)}
            className={`px-3 py-1 rounded-xl text-xs font-bold font-mono border transition-all ${
              liveSimulatorActive 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {liveSimulatorActive ? '● AUTO ON' : '○ MANUAL'}
          </button>
        </div>
      </div>

      {/* Floating Demo Presets Strip */}
      <div className="p-5 rounded-3xl floating-card space-y-3 bg-white border border-slate-200">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          Demo User Presets (Click to Load Profile)
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {demoUsers.map((demo, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => loadDemoUser(demo.data)}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 text-left transition-all duration-200 group flex flex-col justify-between"
            >
              <div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {demo.label}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{demo.desc}</div>
              </div>
              <div className="text-[10px] text-indigo-600 font-mono mt-2 flex items-center gap-1 font-semibold">
                <Play className="w-2.5 h-2.5 fill-indigo-600" />
                <span>{demo.data.watch_time_hours} hrs • {demo.data.avg_session_mins}m</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form & Live Sliders Floating Card */}
        <div className="lg:col-span-5 p-6 rounded-3xl floating-card space-y-5 bg-white border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-display font-semibold text-slate-900 text-base flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              Telemetry Simulator Controls
            </h3>
            {loading && (
              <span className="flex items-center gap-1.5 text-xs text-indigo-600 font-mono font-semibold">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Re-inferring...
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">User Identifier</label>
              <input
                type="text"
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            {/* Live Interactive Sliders */}
            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1 font-mono">
                <span>Watch Time (Hours)</span>
                <span className="text-indigo-600 font-bold">{formData.watch_time_hours} hrs</span>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                step="1"
                value={formData.watch_time_hours}
                onChange={(e) => setFormData({ ...formData, watch_time_hours: parseFloat(e.target.value) })}
                className="w-full accent-indigo-600 bg-slate-100 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1 font-mono">
                <span>Avg Session Duration (Mins)</span>
                <span className="text-cyan-600 font-bold">{formData.avg_session_mins} mins</span>
              </div>
              <input
                type="range"
                min="5"
                max="150"
                step="1"
                value={formData.avg_session_mins}
                onChange={(e) => setFormData({ ...formData, avg_session_mins: parseFloat(e.target.value) })}
                className="w-full accent-cyan-600 bg-slate-100 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1 font-mono">
                <span>Short Session Ratio (&lt;20 mins)</span>
                <span className="text-amber-600 font-bold">{Math.round(formData.short_session_ratio * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={formData.short_session_ratio}
                onChange={(e) => setFormData({ ...formData, short_session_ratio: parseFloat(e.target.value) })}
                className="w-full accent-amber-600 bg-slate-100 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">Preferred Genres</label>
              <div className="flex flex-wrap gap-1.5">
                {genresPool.map((g) => {
                  const selected = formData.top_genres.includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGenre(g)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        selected
                          ? 'bg-indigo-600 text-white border border-indigo-600 shadow-sm'
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
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 text-white font-display font-semibold text-sm hover:opacity-95 shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Manual Re-Analyze</span>
            </motion.button>
          </div>
        </div>

        {/* Output Floating Panel */}
        <div className="lg:col-span-7 space-y-5">
          {error && (
            <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <div>
                <div className="font-bold font-display">Analysis Error</div>
                <div className="text-xs text-rose-700">{error}</div>
              </div>
            </div>
          )}

          {!result && !error && (
            <div className="h-full min-h-[400px] rounded-3xl floating-card p-8 flex flex-col items-center justify-center text-center space-y-4 bg-white border border-slate-200">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1">
                <h4 className="font-display font-bold text-lg text-slate-900">Ready for Inference</h4>
                <p className="text-xs text-slate-500">
                  Select a Demo Preset above or drag sliders to evaluate cohort transitions live.
                </p>
              </div>
            </div>
          )}

          {result && (
            <AnimatePresence mode="wait">
              <motion.div
                key={result.segment_id + '-' + result.user_id}
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                {/* Cohort Output Header Card */}
                <div className="p-6 rounded-3xl floating-card bg-white border border-slate-200 space-y-4 relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                    <div>
                      <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider font-mono">
                        Assigned Cohort #{result.segment_id}
                      </span>
                      <h3 className="font-display text-xl font-bold text-slate-900 mt-0.5">
                        {result.segment_name}
                      </h3>
                    </div>

                    <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono self-start sm:self-auto">
                      <span className="text-slate-500">Distance to Centroid: </span>
                      <span className="text-cyan-700 font-bold tabular-nums">{result.distance_to_centroid}</span>
                    </div>
                  </div>

                  {/* PRIORITY 1: Hybrid / Secondary Segment Boundary Callout */}
                  {result.boundary_confidence_note && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                      <div className="font-bold font-display flex items-center gap-1.5 text-amber-700">
                        <Layers className="w-4 h-4" />
                        Hybrid Tendency Detected (Boundary Viewer)
                      </div>
                      <p className="leading-relaxed text-amber-800 font-sans">
                        {result.boundary_confidence_note}
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {result.segment_description}
                  </p>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                    <span className="font-semibold text-indigo-600 font-display">Recommendation Strategy: </span>
                    {result.recommendation_strategy}
                  </div>
                </div>

                {/* Recommendations Title Grid */}
                <div className="space-y-3">
                  <h4 className="font-display font-semibold text-slate-900 text-sm flex items-center gap-2">
                    <Film className="w-4 h-4 text-cyan-600" />
                    Personalized Recommendations ({result.recommendations.length} Titles)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {result.recommendations.map((rec, idx) => (
                      <motion.div 
                        key={idx}
                        whileHover={{ y: -3 }}
                        className="p-4 rounded-2xl floating-card space-y-2.5 relative overflow-hidden bg-white border border-slate-200"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="font-display font-bold text-sm text-slate-900">{rec.title}</h5>
                          <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-semibold border border-indigo-200">
                            {rec.content_type}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {rec.duration_mins} mins
                          </span>
                          <span>•</span>
                          <span>{rec.genres.join(', ')}</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-50 text-[11px] text-slate-700 border border-slate-200">
                          <span className="font-semibold text-cyan-700">Match Reason: </span>
                          {rec.match_reason}
                        </div>
                      </motion.div>
                    ))}
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
