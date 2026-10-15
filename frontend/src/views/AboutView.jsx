import React from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  Award, 
  BookOpen, 
  Sliders, 
  CheckCircle2, 
  ExternalLink, 
  ShieldCheck, 
  Scale, 
  Sparkles,
  Film
} from 'lucide-react';

export default function AboutView() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } }
  };

  const spotCheckedTitles = [
    { title: "Toy Story", year: 1995, rating: 3.92, votes: 215, genres: "Adventure, Animation, Comedy" },
    { title: "Pulp Fiction", year: 1994, rating: 4.20, votes: 307, genres: "Comedy, Crime, Drama, Thriller" },
    { title: "Forrest Gump", year: 1994, rating: 4.16, votes: 329, genres: "Comedy, Drama, Romance" },
    { title: "The Matrix", year: 1999, rating: 4.19, votes: 278, genres: "Action, Sci-Fi, Thriller" },
    { title: "The Shawshank Redemption", year: 1994, rating: 4.43, votes: 317, genres: "Crime, Drama" },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pt-2"
    >
      {/* Header Banner */}
      <motion.div variants={itemVariants} className="space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Transparency & Methodology</span>
        </div>
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
          Dataset Provenance & Transparent Ranking
        </h2>
        <p className="text-slate-600 text-sm max-w-3xl leading-relaxed">
          AudienceIQ strictly operates under a <strong>Zero Invented Ratings Policy</strong>. Every recommendation score, rating, and vote count is built from open empirical research datasets and ranked with mathematically transparent Bayesian formulas.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Data Attribution & License */}
        <motion.div variants={itemVariants} className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-3xl floating-card bg-white border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">MovieLens Dataset Attribution</h3>
                <p className="text-xs text-slate-500 font-mono">GroupLens Research • University of Minnesota</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              The OTT content catalog is generated from the <strong>MovieLens ml-latest-small</strong> benchmark dataset, compiled by <strong>GroupLens Research</strong> at the University of Minnesota. The dataset incorporates 100,836 real user ratings and 9,742 titles.
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Dataset Version:</span>
                <span className="font-bold text-slate-900">ml-latest-small (GroupLens)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Extracted Titles:</span>
                <span className="font-bold text-indigo-600">598 curated OTT titles</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Rating Scale:</span>
                <span className="font-bold text-slate-900">0.5 - 5.0 Stars (Real User Mean)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Unrated Titles:</span>
                <span className="font-bold text-amber-600">Displays "Not rated"</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-900 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>License & Non-Commercial Notice:</strong> Used strictly for non-commercial educational and research evaluation under the GroupLens dataset terms of use. No external third-party APIs are contacted at runtime.
              </div>
            </div>
          </div>

          {/* Real Rating Verification Spot-Check */}
          <div className="p-6 rounded-3xl floating-card bg-white border border-slate-200 space-y-3">
            <h3 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Source Dataset Rating Spot-Check
            </h3>
            <p className="text-xs text-slate-500">
              Verified ground-truth ratings matching GroupLens <code className="text-indigo-600 font-mono">ratings.csv</code>:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-2">Title</th>
                    <th className="pb-2">Year</th>
                    <th className="pb-2 text-right">Mean ★</th>
                    <th className="pb-2 text-right">Votes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {spotCheckedTitles.map((t, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 font-medium text-slate-900 font-sans">{t.title}</td>
                      <td className="py-2 text-slate-500">{t.year}</td>
                      <td className="py-2 text-right font-bold text-amber-600">★ {t.rating.toFixed(2)}</td>
                      <td className="py-2 text-right text-slate-600">{t.votes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Ranking Formula & Weights */}
        <motion.div variants={itemVariants} className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-3xl floating-card bg-white border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">Bayesian Weighted Rating (WR)</h3>
                <p className="text-xs text-slate-500 font-mono">Prevents low-vote anomalies from dominating</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-cyan-300 font-mono text-xs overflow-x-auto shadow-inner">
              <div className="text-slate-400 mb-1">// Bayesian IMDB / MovieLens Weighted Rating:</div>
              <div className="text-white text-sm font-bold">
                WR = (v / (v + m)) * R + (m / (v + m)) * C
              </div>
              <div className="text-slate-400 mt-2 space-y-0.5 text-[11px]">
                <div>• <span className="text-cyan-400">R</span> = Title's empirical mean rating</div>
                <div>• <span className="text-cyan-400">v</span> = Title's verified user vote count</div>
                <div>• <span className="text-cyan-400">C</span> = Catalog-wide mean rating (3.64)</div>
                <div>• <span className="text-cyan-400">m</span> = 80th percentile vote threshold (105.0)</div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="font-display font-bold text-sm text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                Multi-Objective Candidate Scoring Formula
              </h4>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono">
                <div className="font-bold text-slate-900 text-[12px]">
                  Score = (w_genre * genre_match) + (w_rating * normalized(WR)) + (w_segment * segment_fit)
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-center">
                  <span className="text-[10px] text-indigo-600 font-mono font-bold block uppercase">w_genre</span>
                  <span className="text-lg font-display font-extrabold text-indigo-900">45%</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Top-Genre Overlap</span>
                </div>

                <div className="p-3 rounded-2xl bg-cyan-50/80 border border-cyan-200 text-center">
                  <span className="text-[10px] text-cyan-700 font-mono font-bold block uppercase">w_rating</span>
                  <span className="text-lg font-display font-extrabold text-cyan-900">30%</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Normalized WR</span>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-center">
                  <span className="text-[10px] text-emerald-700 font-mono font-bold block uppercase">w_segment</span>
                  <span className="text-lg font-display font-extrabold text-emerald-900">25%</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Duration & Cohort</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                <strong>Fallback Strategy:</strong> If a user requests a niche or unpopulated genre combination, slots are sequentially filled via (a) adjacent genre discovery and (b) globally top-rated Bayesian titles, ensuring 10+ personalized titles with zero duplicates.
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
