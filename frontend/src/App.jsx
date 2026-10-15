import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CommandPalette from './components/CommandPalette';
import LandingView from './views/LandingView';
import DashboardView from './views/DashboardView';
import SegmentsView from './views/SegmentsView';
import AnalyzerView from './views/AnalyzerView';
import EvaluationView from './views/EvaluationView';
import HealthView from './views/HealthView';
import ArchitectureView from './views/ArchitectureView';
import AboutView from './views/AboutView';
import RetentionView from './views/RetentionView';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [apiHealth, setApiHealth] = useState(null);
  const [metricsData, setMetricsData] = useState(null);
  const [segmentProfiles, setSegmentProfiles] = useState([]);
  const [experimentsData, setExperimentsData] = useState([]);
  const [projectionsData, setProjectionsData] = useState([]);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [selectedDemoIdx, setSelectedDemoIdx] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

  useEffect(() => {
    const fetchWithFallback = async (endpoint) => {
      try {
        let resp;
        try {
          resp = await fetch(`${API_BASE_URL}${endpoint}`);
        } catch (err) {
          resp = await fetch(`http://localhost:8000${endpoint}`);
        }
        if (resp && resp.ok) {
          return await resp.json();
        }
      } catch (err) {
        // Silently catch network errors if backend is not reachable yet
      }
      return null;
    };

    const fetchRealBackendData = async () => {
      const [health, metrics, segments, experiments, projections] = await Promise.all([
        fetchWithFallback('/health'),
        fetchWithFallback('/metrics'),
        fetchWithFallback('/segments'),
        fetchWithFallback('/experiments'),
        fetchWithFallback('/projections'),
      ]);

      if (health) setApiHealth(health);
      if (metrics) setMetricsData(metrics);
      if (segments) setSegmentProfiles(segments);
      if (experiments) setExperimentsData(experiments);
      if (projections && projections.projections) setProjectionsData(projections.projections);
    };

    fetchRealBackendData();
  }, []);

  const handleSelectDemoFromPalette = (idx) => {
    setSelectedDemoIdx(idx);
  };

  return (
    <div className="h-screen h-[100dvh] w-full overflow-hidden bg-mesh bg-[#F8FAFC] text-slate-900 flex flex-col font-sans relative selection:bg-indigo-600 selection:text-white">
      {/* Floating Glass Navigation Header (Fixed at top) */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        apiHealth={apiHealth}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      />

      {/* Command Palette Modal */}
      <CommandPalette 
        isOpen={commandPaletteOpen} 
        onClose={setCommandPaletteOpen} 
        setActiveTab={setActiveTab}
        onSelectDemo={handleSelectDemoFromPalette}
      />

      {/* Main Internal Scrolling Content Viewport (Fit-To-Screen Shell) */}
      <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 sm:px-6 md:px-8 pb-10 max-w-7xl mx-auto w-full custom-scrollbar">
        {activeTab === 'landing' && (
          <LandingView 
            setActiveTab={setActiveTab} 
            metricsData={metricsData} 
            segmentProfiles={segmentProfiles} 
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView 
            metricsData={metricsData} 
            segmentProfiles={segmentProfiles} 
            setActiveTab={setActiveTab} 
          />
        )}

        {activeTab === 'segments' && (
          <SegmentsView 
            segmentProfiles={segmentProfiles} 
            projectionsData={projectionsData} 
          />
        )}

        {activeTab === 'analyzer' && (
          <AnalyzerView apiBaseUrl={API_BASE_URL} selectedDemoIdx={selectedDemoIdx} />
        )}

        {activeTab === 'retention' && (
          <RetentionView apiBaseUrl={API_BASE_URL} />
        )}

        {activeTab === 'evaluation' && (
          <EvaluationView 
            metricsData={metricsData} 
            experimentsData={experimentsData} 
          />
        )}

        {activeTab === 'health' && (
          <HealthView apiHealth={apiHealth} apiBaseUrl={API_BASE_URL} />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureView />
        )}

        {activeTab === 'about' && (
          <AboutView />
        )}
      </main>
    </div>
  );
}
