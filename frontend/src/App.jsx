import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CommandPalette from './components/CommandPalette';
import DashboardView from './views/DashboardView';
import SegmentsView from './views/SegmentsView';
import AnalyzerView from './views/AnalyzerView';
import EvaluationView from './views/EvaluationView';
import HealthView from './views/HealthView';
import ArchitectureView from './views/ArchitectureView';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [apiHealth, setApiHealth] = useState(null);
  const [metricsData, setMetricsData] = useState(null);
  const [segmentProfiles, setSegmentProfiles] = useState([]);
  const [experimentsData, setExperimentsData] = useState([]);
  const [projectionsData, setProjectionsData] = useState([]);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [selectedDemoIdx, setSelectedDemoIdx] = useState(null);

  const API_BASE_URL = 'http://localhost:8000';

  useEffect(() => {
    const fetchRealBackendData = async () => {
      // 1. Fetch /health
      try {
        const resp = await fetch(`${API_BASE_URL}/health`);
        if (resp.ok) setApiHealth(await resp.json());
      } catch (err) {
        console.log('Health fetch info:', err);
      }

      // 2. Fetch /metrics
      try {
        const resp = await fetch(`${API_BASE_URL}/metrics`);
        if (resp.ok) setMetricsData(await resp.json());
      } catch (err) {
        console.log('Metrics fetch info:', err);
      }

      // 3. Fetch /segments
      try {
        const resp = await fetch(`${API_BASE_URL}/segments`);
        if (resp.ok) setSegmentProfiles(await resp.json());
      } catch (err) {
        console.log('Segments fetch info:', err);
      }

      // 4. Fetch /experiments
      try {
        const resp = await fetch(`${API_BASE_URL}/experiments`);
        if (resp.ok) setExperimentsData(await resp.json());
      } catch (err) {
        console.log('Experiments fetch info:', err);
      }

      // 5. Fetch /projections
      try {
        const resp = await fetch(`${API_BASE_URL}/projections`);
        if (resp.ok) {
          const d = await resp.json();
          if (d && d.projections) setProjectionsData(d.projections);
        }
      } catch (err) {
        console.log('Projections fetch info:', err);
      }
    };

    fetchRealBackendData();
  }, []);

  const handleSelectDemoFromPalette = (idx) => {
    setSelectedDemoIdx(idx);
  };

  return (
    <div className="min-h-screen bg-mesh bg-[#F8FAFC] text-slate-900 flex flex-col font-sans relative selection:bg-indigo-600 selection:text-white">
      {/* Floating Glass Navigation Header */}
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

      {/* Main Floating Content Viewport */}
      <main className="flex-1 px-4 sm:px-8 pb-12 max-w-7xl mx-auto w-full">
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
      </main>
    </div>
  );
}
