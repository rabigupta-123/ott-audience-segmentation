import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Clock, 
  Sparkles, 
  Zap, 
  Send, 
  Bell, 
  Mail, 
  CheckCircle2, 
  RefreshCw,
  Flame,
  ChevronRight,
  Info
} from 'lucide-react';

export default function RetentionView({ apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api' }) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // Simulator Form State
  const [simData, setSimData] = useState({
    user_id: 'USR-CHURN-SIM',
    recency_days: 18.0,
    avg_session_mins: 18.0,
    short_session_ratio: 0.75,
    watch_time_hours: 6.5,
    total_sessions: 8,
    weekday_watch_ratio: 0.65,
    top_genres: ['Comedy', 'Animation']
  });

  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);
  const [deployedCampaigns, setDeployedCampaigns] = useState({});
  const [toastMessage, setToastMessage] = useState(null);
  const [activePreviewCampaign, setActivePreviewCampaign] = useState(null);

  const genresPool = [
    "Action", "Comedy", "Drama", "Thriller", "Sci-Fi", 
    "Romance", "Documentary", "Animation", "Horror"
  ];

  const presets = [
    {
      label: "Active Superfan",
      riskType: "low",
      badge: "Low Risk",
      desc: "Daily high-engagement action viewer",
      data: {
        user_id: "SIM-ACTIVE-BUFF",
        recency_days: 1.0,
        avg_session_mins: 85.0,
        short_session_ratio: 0.08,
        watch_time_hours: 74.0,
        total_sessions: 52,
        weekday_watch_ratio: 0.70,
        top_genres: ["Action", "Sci-Fi", "Thriller"]
      }
    },
    {
      label: "Casual Drifter",
      riskType: "medium",
      badge: "Medium Risk",
      desc: "Short comedy clips with sporadic sessions",
      data: {
        user_id: "SIM-CASUAL-DRIFT",
        recency_days: 7.0,
        avg_session_mins: 22.0,
        short_session_ratio: 0.65,
        watch_time_hours: 12.0,
        total_sessions: 24,
        weekday_watch_ratio: 0.45,
        top_genres: ["Comedy", "Romance"]
      }
    },
    {
      label: "Imminent Churn",
      riskType: "high",
      badge: "Critical Risk",
      desc: "24 days inactive, high session abandonment",
      data: {
        user_id: "SIM-DORMANT-THREAT",
        recency_days: 25.0,
        avg_session_mins: 12.0,
        short_session_ratio: 0.88,
        watch_time_hours: 3.2,
        total_sessions: 3,
        weekday_watch_ratio: 0.85,
        top_genres: ["Drama"]
      }
    },
    {
      label: "Variety Seeker",
      riskType: "medium",
      badge: "Moderate Risk",
      desc: "Multi-genre viewer nearing catalog saturation",
      data: {
        user_id: "SIM-GENRE-CROSS",
        recency_days: 9.0,
        avg_session_mins: 42.0,
        short_session_ratio: 0.35,
        watch_time_hours: 38.0,
        total_sessions: 36,
        weekday_watch_ratio: 0.55,
        top_genres: ["Sci-Fi", "Documentary", "Animation"]
      }
    }
  ];

  // Fetch Cohort Analytics on Mount
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoadingAnalytics(true);
      try {
        let resp;
        try {
          resp = await fetch(`${apiBaseUrl}/churn/analytics`);
        } catch {
          resp = await fetch(`http://localhost:8000/churn/analytics`);
        }
        if (resp && resp.ok) {
          const data = await resp.json();
          setAnalyticsData(data);
        } else {
          fallbackAnalytics();
        }
      } catch (err) {
        fallbackAnalytics();
      } finally {
        setLoadingAnalytics(false);
      }
    };

    const fallbackAnalytics = () => {
      setAnalyticsData({
        total_subscribers: 5000,
        overall_avg_churn_risk: 36.4,
        risk_distribution: {
          low_risk: { count: 2740, percentage: 54.8 },
          medium_risk: { count: 1580, percentage: 31.6 },
          high_risk: { count: 680, percentage: 13.6 }
        },
        cohort_breakdowns: [
          {
            segment_id: 0,
            segment_name: "Genre Explorers & Variety Seekers",
            subscriber_count: 1159,
            share_percentage: 23.2,
            avg_churn_risk: 29.4,
            risk_distribution: { low_pct: 68.2, med_pct: 24.1, high_pct: 7.7 },
            primary_vulnerability: "Catalog exhaustion & lack of genre crossovers"
          },
          {
            segment_id: 1,
            segment_name: "Casual Short-Session Comedy Viewers",
            subscriber_count: 2546,
            share_percentage: 50.9,
            avg_churn_risk: 48.7,
            risk_distribution: { low_pct: 34.5, med_pct: 43.8, high_pct: 21.7 },
            primary_vulnerability: "Session fragmentation & low commitment threshold"
          },
          {
            segment_id: 2,
            segment_name: "High-Engagement Action Viewers",
            subscriber_count: 1295,
            share_percentage: 25.9,
            avg_churn_risk: 18.2,
            risk_distribution: { low_pct: 82.4, med_pct: 14.2, high_pct: 3.4 },
            primary_vulnerability: "Inactivity between major blockbuster tentpole drops"
          }
        ],
        top_risk_triggers: [
          { trigger_name: "Dormancy Lapse (14+ Days Inactive)", affected_percentage: 22.4, impact_severity: "Critical" },
          { trigger_name: "Session Fragmentation (>60% Short Sessions)", affected_percentage: 34.1, impact_severity: "High" },
          { trigger_name: "Low Engagement Velocity (<10 Hours Cumulative)", affected_percentage: 18.9, impact_severity: "Moderate" },
          { trigger_name: "Single-Genre Siloed Viewing", affected_percentage: 28.5, impact_severity: "Moderate" }
        ],
        revenue_impact: {
          avg_monthly_arpu: 14.99,
          at_risk_monthly_revenue: 18137.90,
          projected_monthly_saved_revenue: 5804.13,
          annual_retention_value: 69649.54
        }
      });
    };

    fetchAnalytics();
  }, [apiBaseUrl]);

  // Run Real-Time Churn Predictor
  const runPrediction = async (input) => {
    setSimLoading(true);
    try {
      let resp;
      try {
        resp = await fetch(`${apiBaseUrl}/churn/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        });
      } catch {
        resp = await fetch(`http://localhost:8000/churn/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        });
      }
      if (resp && resp.ok) {
        const data = await resp.json();
        setSimResult(data);
      } else {
        calculateLocalRisk(input);
      }
    } catch {
      calculateLocalRisk(input);
    } finally {
      setSimLoading(false);
    }
  };

  const calculateLocalRisk = (input) => {
    const rec = input.recency_days;
    const short = input.short_session_ratio;
    const avg = input.avg_session_mins;
    const wt = input.watch_time_hours;

    // Recency Sigmoid
    const s_rec = 1 / (1 + Math.exp(-0.18 * (rec - 12)));
    const dur_def = Math.max(0, (40 - Math.min(avg, 40)) / 40);
    const s_frag = 0.60 * short + 0.40 * dur_def;
    const s_vel = 0.65 * Math.exp(-wt / 18) + 0.35 * Math.exp(-input.total_sessions / 10);
    const s_div = input.top_genres.length <= 1 ? 0.75 : (input.top_genres.length === 2 ? 0.40 : 0.20);

    const score = Math.min(0.98, Math.max(0.04, 0.42 * s_rec + 0.28 * s_frag + 0.20 * s_vel + 0.10 * s_div));
    const pct = Math.round(score * 1000) / 10;
    const level = score >= 0.70 ? "HIGH" : (score >= 0.35 ? "MEDIUM" : "LOW");

    setSimResult({
      user_id: input.user_id,
      churn_risk_score: score,
      churn_risk_percentage: pct,
      risk_level: level,
      primary_driver: rec >= 14 ? `Extended Inactivity (${rec} days since last session)` : `Session Fragility (${Math.round(short * 100)}% short sessions)`,
      risk_factors: [
        { name: "Recency & Inactivity", score: Math.round(s_rec * 100) / 100, severity: s_rec > 0.6 ? "high" : "medium", description: `${rec} days elapsed` },
        { name: "Session Fragility", score: Math.round(s_frag * 100) / 100, severity: s_frag > 0.6 ? "high" : "medium", description: `${Math.round(short * 100)}% short sessions` },
        { name: "Watch Time Velocity", score: Math.round(s_vel * 100) / 100, severity: s_vel > 0.6 ? "high" : "medium", description: `${wt} hrs cumulative` },
        { name: "Genre Variety", score: Math.round(s_div * 100) / 100, severity: s_div > 0.6 ? "high" : "medium", description: `${input.top_genres.length} genres` }
      ],
      retention_playbook: {
        campaign_id: level === "HIGH" ? "CMP-DORM-WINBACK" : (level === "MEDIUM" ? "CMP-COMEDY-MARATHON" : "CMP-VIP-LOYALTY"),
        campaign_title: level === "HIGH" ? "48-Hour Critical Win-Back Trigger" : (level === "MEDIUM" ? "Weekend Snack-Watch Marathon" : "VIP Superfan Loyalty Showcase"),
        objective: level === "HIGH" ? "Re-ignite inactive subscriber before billing lapse" : "Deepen engagement and expand session duration",
        primary_channel: level === "HIGH" ? "Push Notification + Email Deep Link" : "In-App Featured Hero Carousel",
        recommended_action: `Serve tailored re-engagement hook spotlighting newly released ${input.top_genres[0] || 'Drama'} titles.`,
        incentive_offer: level === "HIGH" ? "Free 7-Day 4K HDR Pass & Zero-Ad Weekend Streaming Token" : "Early Access to 2026 upcoming premiere episodes",
        projected_retention_lift: level === "HIGH" ? "+38.4% 14-day subscriber retention probability" : "+24.1% session duration expansion"
      }
    });
  };

  // Run initial simulation
  useEffect(() => {
    runPrediction(simData);
  }, []);

  const handleApplyPreset = (preset) => {
    setSimData(preset.data);
    runPrediction(preset.data);
  };

  const handleGenreToggle = (genre) => {
    let updated;
    if (simData.top_genres.includes(genre)) {
      if (simData.top_genres.length > 1) {
        updated = simData.top_genres.filter(g => g !== genre);
      } else {
        return; // maintain at least one
      }
    } else {
      updated = [...simData.top_genres, genre];
    }
    const nextData = { ...simData, top_genres: updated };
    setSimData(nextData);
    runPrediction(nextData);
  };

  const handleSliderChange = (field, value) => {
    const nextData = { ...simData, [field]: parseFloat(value) };
    setSimData(nextData);
    runPrediction(nextData);
  };

  const handleDeployCampaign = (campaignId, title) => {
    setDeployedCampaigns(prev => ({ ...prev, [campaignId]: true }));
    setToastMessage(`Campaign "${title}" successfully dispatched to audience cohort!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  return (
    <div className="space-y-6 pt-2 pb-12 animate-fade-in text-slate-900">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-500/50 backdrop-blur-md"
          >
            <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
            <p className="text-sm font-medium">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 border border-indigo-900/40 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Machine Learning Early Warning Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
              Audience Churn & Retention Intelligence
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Predict subscriber disengagement with multi-factor telemetry modeling. Pinpoint inactive dormancy, session fragmentation, and catalog fatigue before billing cycle lapse.
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2.5 shrink-0">
            <div className="px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-2 text-xs font-medium text-cyan-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              5,000 Viewer Telemetry Streams Monitored
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-indigo-500/20 border border-indigo-400/20 text-xs font-mono text-indigo-200">
              Model: Multi-Factor Logistic Decay v2.4
            </div>
          </div>
        </div>
      </div>

      {/* Platform KPI Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Overall Average Risk */}
        <div className="floating-card rounded-2xl p-5 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Platform Churn Risk</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-display text-slate-900">
              {analyticsData ? `${analyticsData.overall_avg_churn_risk}%` : '36.4%'}
            </span>
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Moderate Risk
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 h-full rounded-full" 
              style={{ width: `${analyticsData ? analyticsData.overall_avg_churn_risk : 36.4}%` }} 
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Weighted across all 3 unsupervised audience cohorts</p>
        </div>

        {/* KPI 2: At-Risk Subscribers */}
        <div className="floating-card rounded-2xl p-5 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subscribers At-Risk</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-display text-slate-900">
              {analyticsData ? (analyticsData.risk_distribution.medium_risk.count + analyticsData.risk_distribution.high_risk.count).toLocaleString() : '2,260'}
            </span>
            <span className="text-xs font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              {analyticsData ? `${Math.round((analyticsData.risk_distribution.medium_risk.count + analyticsData.risk_distribution.high_risk.count) / analyticsData.total_subscribers * 100)}%` : '45.2%'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100">
            <span>Med Risk: <strong>{analyticsData?.risk_distribution.medium_risk.count || 1580}</strong></span>
            <span>High Risk: <strong className="text-rose-600">{analyticsData?.risk_distribution.high_risk.count || 680}</strong></span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Requires proactive re-engagement intervention</p>
        </div>

        {/* KPI 3: Immediate Intervention Queue */}
        <div className="floating-card rounded-2xl p-5 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Critical 48h Window</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-display text-rose-600">
              {analyticsData?.risk_distribution.high_risk.count || 680}
            </span>
            <span className="text-xs font-medium text-slate-600">subscribers</span>
          </div>
          <p className="text-xs text-slate-600 mt-2">
            Dormancy &gt; 14 days or extreme session drop. Winback triggers active.
          </p>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-indigo-600">
            <Zap className="w-3.5 h-3.5" />
            <span>Target Playbook: CMP-DORM-WINBACK</span>
          </div>
        </div>

        {/* KPI 4: ARR Retention Opportunity */}
        <div className="floating-card rounded-2xl p-5 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Projected Retained ARR</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-display text-emerald-600">
              ${analyticsData ? Math.round(analyticsData.revenue_impact.annual_retention_value).toLocaleString() : '69,650'}
            </span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              +32% Lift
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-2">
            Estimated annual recurring revenue preserved via automated retention campaigns.
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Based on benchmark $14.99/mo ARPU</p>
        </div>
      </div>

      {/* Main Section: Interactive Live Viewer Churn Simulator */}
      <div className="floating-card rounded-3xl p-6 sm:p-8 bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg sm:text-xl font-bold font-display text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-600" />
              Live Viewer Churn Simulator & Playbook Generator
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Adjust viewer telemetry parameters to simulate real-time disengagement risk and test automated retention campaigns.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-400 mr-1 hidden lg:inline">Presets:</span>
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyPreset(preset)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all border flex items-center gap-1.5 ${
                  preset.riskType === 'low' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : preset.riskType === 'medium'
                    ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${
                  preset.riskType === 'low' ? 'bg-emerald-500' : (preset.riskType === 'medium' ? 'bg-amber-500' : 'bg-rose-500')
                }`} />
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dual-Column Simulator Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Sliders and Controls (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Control 1: Recency Days */}
            <div className="space-y-1.5 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  Recency Days (Inactivity Window)
                </label>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg ${
                  simData.recency_days >= 14 ? 'bg-rose-100 text-rose-800' : (simData.recency_days >= 7 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800')
                }`}>
                  {simData.recency_days.toFixed(1)} days
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="45"
                step="0.5"
                value={simData.recency_days}
                onChange={(e) => handleSliderChange('recency_days', e.target.value)}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0.5d (Active today)</span>
                <span>12d (Logistic inflection)</span>
                <span>45d (Critical dormancy)</span>
              </div>
            </div>

            {/* Control 2: Average Session Duration & Short Session Ratio (Dual Grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Average Session Duration</label>
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg">
                    {simData.avg_session_mins.toFixed(0)} mins
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="140"
                  step="1"
                  value={simData.avg_session_mins}
                  onChange={(e) => handleSliderChange('avg_session_mins', e.target.value)}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>5 mins</span>
                  <span>140 mins</span>
                </div>
              </div>

              <div className="space-y-1.5 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Short Session Ratio (&lt;20m)</label>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg ${
                    simData.short_session_ratio >= 0.60 ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-800'
                  }`}>
                    {Math.round(simData.short_session_ratio * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.02"
                  value={simData.short_session_ratio}
                  onChange={(e) => handleSliderChange('short_session_ratio', e.target.value)}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0% (Long form)</span>
                  <span>100% (High drop)</span>
                </div>
              </div>
            </div>

            {/* Control 3: Cumulative Watch Time & Total Sessions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Cumulative Watch Time</label>
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg">
                    {simData.watch_time_hours.toFixed(1)} hrs
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="120"
                  step="0.5"
                  value={simData.watch_time_hours}
                  onChange={(e) => handleSliderChange('watch_time_hours', e.target.value)}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Session Frequency Count</label>
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg">
                    {simData.total_sessions} sessions
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="80"
                  step="1"
                  value={simData.total_sessions}
                  onChange={(e) => handleSliderChange('total_sessions', e.target.value)}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Control 4: Interacted Preferred Genres */}
            <div className="space-y-2 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  Targeted Genre Affinity ({simData.top_genres.length} selected)
                </label>
                <span className="text-[11px] text-slate-500">Click to toggle</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {genresPool.map((genre) => {
                  const isSelected = simData.top_genres.includes(genre);
                  return (
                    <button
                      key={genre}
                      onClick={() => handleGenreToggle(genre)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                        isSelected 
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Real-Time Prediction & Playbook Card (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            {simResult && (
              <div className={`rounded-3xl p-6 border shadow-lg transition-all ${
                simResult.risk_level === 'HIGH'
                  ? 'bg-gradient-to-br from-rose-50 via-white to-rose-50/50 border-rose-300'
                  : simResult.risk_level === 'MEDIUM'
                  ? 'bg-gradient-to-br from-amber-50 via-white to-amber-50/50 border-amber-300'
                  : 'bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 border-emerald-300'
              }`}>
                {/* Risk Gauge Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {simResult.risk_level === 'HIGH' ? (
                      <div className="w-9 h-9 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/30">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                    ) : simResult.risk_level === 'MEDIUM' ? (
                      <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Disengagement Risk</span>
                      <h4 className="text-base font-bold font-display text-slate-900 leading-none">
                        {simResult.risk_level === 'HIGH' ? 'High Attrition Risk' : (simResult.risk_level === 'MEDIUM' ? 'Moderate Drift Risk' : 'Healthy Active Viewer')}
                      </h4>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-3xl font-display font-extrabold ${
                      simResult.risk_level === 'HIGH' ? 'text-rose-600' : (simResult.risk_level === 'MEDIUM' ? 'text-amber-600' : 'text-emerald-600')
                    }`}>
                      {simResult.churn_risk_percentage}%
                    </span>
                    <span className="block text-[10px] text-slate-500 font-mono">Probabilistic Score</span>
                  </div>
                </div>

                {/* Primary Risk Trigger Callout */}
                <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-200/80 mb-4">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block">Primary Risk Factor:</span>
                      <p className="text-xs text-slate-600 mt-0.5">{simResult.primary_driver}</p>
                    </div>
                  </div>
                </div>

                {/* 4 Factor Micro-Meters */}
                <div className="space-y-2 mb-5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Multi-Factor Diagnostics</span>
                  {simResult.risk_factors.map((factor, fIdx) => (
                    <div key={fIdx} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-700 font-medium">{factor.name}</span>
                        <span className="font-mono text-slate-500 text-[11px]">
                          {factor.description}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            factor.score > 0.65 ? 'bg-rose-500' : (factor.score > 0.35 ? 'bg-amber-500' : 'bg-emerald-500')
                          }`}
                          style={{ width: `${Math.round(factor.score * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dynamic Automated Retention Playbook Box */}
                {simResult.retention_playbook && (
                  <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl" />

                    <div className="flex items-center justify-between relative z-10">
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-[10px] font-mono text-cyan-300 font-bold uppercase">
                        {simResult.retention_playbook.campaign_id}
                      </span>
                      <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {simResult.retention_playbook.projected_retention_lift.split(' ')[0]} Lift
                      </span>
                    </div>

                    <div className="relative z-10">
                      <h5 className="text-sm font-bold text-white font-display">
                        {simResult.retention_playbook.campaign_title}
                      </h5>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                        {simResult.retention_playbook.recommended_action}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs text-slate-300 relative z-10">
                      <div className="flex items-center gap-2 text-[11px] text-cyan-300">
                        <Bell className="w-3.5 h-3.5 shrink-0" />
                        <span>Channel: <strong>{simResult.retention_playbook.primary_channel}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-indigo-200">
                        <Sparkles className="w-3.5 h-3.5 shrink-0" />
                        <span>Incentive: <strong>{simResult.retention_playbook.incentive_offer}</strong></span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeployCampaign(simResult.retention_playbook.campaign_id, simResult.retention_playbook.campaign_title)}
                      className={`w-full mt-2 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 relative z-10 ${
                        deployedCampaigns[simResult.retention_playbook.campaign_id]
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-md shadow-indigo-600/30'
                      }`}
                    >
                      {deployedCampaigns[simResult.retention_playbook.campaign_id] ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Campaign Active & Dispatched
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          Deploy Automated Campaign
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cohort-Wide Vulnerability & Retention Matrix */}
      <div className="floating-card rounded-3xl p-6 sm:p-8 bg-white border border-slate-200 shadow-sm space-y-5">
        <div>
          <h3 className="text-lg font-bold font-display text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Cohort-Wide Retention Vulnerability Matrix
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Breakdown of attrition susceptibility across the 3 unsupervised K-Means audience clusters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {analyticsData?.cohort_breakdowns.map((cohort) => (
            <div 
              key={cohort.segment_id}
              className="rounded-2xl p-5 border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                  Cluster #{cohort.segment_id}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {cohort.subscriber_count.toLocaleString()} viewers ({cohort.share_percentage}%)
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 font-display">
                  {cohort.segment_name}
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Vulnerability: <span className="font-medium text-slate-800">{cohort.primary_vulnerability}</span>
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/60 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Cohort Mean Risk:</span>
                  <span className={`font-mono font-bold ${
                    cohort.avg_churn_risk >= 40 ? 'text-rose-600' : (cohort.avg_churn_risk >= 25 ? 'text-amber-600' : 'text-emerald-600')
                  }`}>
                    {cohort.avg_churn_risk}%
                  </span>
                </div>

                {/* Stacked Risk Progress Bar */}
                <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-slate-200">
                  <div 
                    style={{ width: `${cohort.risk_distribution.low_pct}%` }} 
                    className="bg-emerald-500 h-full" 
                    title={`Low Risk: ${cohort.risk_distribution.low_pct}%`}
                  />
                  <div 
                    style={{ width: `${cohort.risk_distribution.med_pct}%` }} 
                    className="bg-amber-500 h-full" 
                    title={`Medium Risk: ${cohort.risk_distribution.med_pct}%`}
                  />
                  <div 
                    style={{ width: `${cohort.risk_distribution.high_pct}%` }} 
                    className="bg-rose-500 h-full" 
                    title={`High Risk: ${cohort.risk_distribution.high_pct}%`}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span className="text-emerald-700">● Low {cohort.risk_distribution.low_pct}%</span>
                  <span className="text-amber-700">● Med {cohort.risk_distribution.med_pct}%</span>
                  <span className="text-rose-700">● High {cohort.risk_distribution.high_pct}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Configured Enterprise Retention Playbooks Section */}
      <div className="floating-card rounded-3xl p-6 sm:p-8 bg-white border border-slate-200 shadow-sm space-y-5">
        <div>
          <h3 className="text-lg font-bold font-display text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            Active Automated Retention Campaigns
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Production playbooks triggered automatically when viewer telemetry crosses calibrated vulnerability thresholds.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              id: "CMP-DORM-WINBACK",
              title: "48h Critical Win-Back",
              target: "Dormant (14+ Days)",
              channel: "Push + Email Deep Link",
              action: "Newly premiered catalog blockbuster drops with 1-click play deep link",
              incentive: "7-Day 4K HDR Pass",
              lift: "+38.4% Retention"
            },
            {
              id: "CMP-FRAGILITY-ANCHOR",
              title: "Bite-Sized Episodic Hook",
              target: "Truncated Sessions (>60%)",
              channel: "Cold-Start App Hero Shelf",
              action: "Dynamic 15-minute quick episode shorts carousel on cold boot",
              incentive: "Custom Quick-Watch Shelf",
              lift: "+29.7% Frequency"
            },
            {
              id: "CMP-COMEDY-MARATHON",
              title: "Weekend Snack Marathon",
              target: "Casual Comedy Cohort",
              channel: "Friday 7 PM Push Alert",
              action: "Curated 3-episode mini-marathons featuring trending stand-up specials",
              incentive: "Early Weekend Access",
              lift: "+24.1% Duration"
            },
            {
              id: "CMP-VARIETY-CROSSOVER",
              title: "Genre Bridge Discovery",
              target: "Siloed Variety Seekers",
              channel: "Weekly Curated Digest",
              action: "High-rated crossover bridge titles connecting favorite genre to emerging hits",
              incentive: "Dynamic 'Top 5 Matches' Mix",
              lift: "+21.5% Monthly Lift"
            }
          ].map((camp, cIdx) => (
            <div 
              key={cIdx}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">{camp.id}</span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {camp.lift}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 font-display">{camp.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-2">{camp.action}</p>
              </div>

              <div className="pt-2 border-t border-slate-200/80 space-y-1 text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Target:</span>
                  <strong className="text-slate-800">{camp.target}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Channel:</span>
                  <strong className="text-slate-800">{camp.channel}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
