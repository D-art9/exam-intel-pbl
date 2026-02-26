import { Routes, Route } from 'react-router-dom';
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



function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="analysis" element={<BrainPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="how-it-works" element={<HowItWorksPage />} />
        <Route path="flow" element={<FlowPage />} />
        <Route path="subject-results/:documentId" element={<SubjectAnalysisPage />} />
        <Route path="dashboard/:documentId" element={<SplitAnalysisPage />} />
        <Route path="syllabus-archive" element={<SyllabusArchivePage />} />


      </Route>
    </Routes>
  );
}

export default App;
