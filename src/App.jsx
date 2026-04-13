import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { LandingPage } from './pages/LandingPage';
import { UploadPage } from './pages/UploadPage';
import { BrainPage } from './pages/BrainPage';
import { AboutPage } from './pages/AboutPage';
import { FlowPage } from './pages/FlowPage';
import { SubjectAnalysisPage } from './pages/SubjectAnalysisPage';
import { SyllabusArchivePage } from './pages/SyllabusArchivePage';

import { ContactPage } from './pages/ContactPage';
import { DashboardPage } from './pages/DashboardPage';
import { SplitAnalysisPage } from './pages/SplitAnalysisPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { LecturePlanChatPage } from './pages/LecturePlanChatPage';
import { AnalysisPage } from './pages/AnalysisPage';
import ModeSelection from './pages/ModeSelection';
import { PaperGenerator } from './pages/PaperGenerator';
import AboutIntelligence from './pages/AboutIntelligence';



const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const PING_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

function App() {
  useEffect(() => {
    const ping = () => {
      fetch(`${BACKEND_URL}/health/`, { method: 'GET' })
        .then(() => console.log('[Keep-Alive] Backend pinged successfully.'))
        .catch(() => console.warn('[Keep-Alive] Backend ping failed.'));
    };

    ping(); // Ping immediately on load
    const interval = setInterval(ping, PING_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/mode-selection" replace />} />
        <Route path="mode-selection" element={<ModeSelection />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="paper-generator/:documentId" element={<PaperGenerator />} />
        <Route path="analysis" element={<BrainPage />} />
        <Route path="processing/:documentId" element={<AnalysisPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="how-it-works" element={<HowItWorksPage />} />
        <Route path="flow" element={<FlowPage />} />
        <Route path="mission-intel" element={<AboutIntelligence />} />
        <Route path="subject-results/:documentId" element={<SubjectAnalysisPage />} />
        <Route path="dashboard/:documentId" element={<SplitAnalysisPage />} />
        <Route path="lecture-plan/:documentId" element={<LecturePlanChatPage />} />
        <Route path="syllabus-archive" element={<SyllabusArchivePage />} />


      </Route>
    </Routes>
  );
}

export default App;
