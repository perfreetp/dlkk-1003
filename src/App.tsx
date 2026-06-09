import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import StudyListPage from '@/pages/StudyListPage';
import ViewerPage from '@/pages/ViewerPage';
import ReportPage from '@/pages/ReportPage';
import ConsultationPage from '@/pages/ConsultationPage';
import QualityPage from '@/pages/QualityPage';
import ArchivePage from '@/pages/ArchivePage';
import SettingsPage from '@/pages/SettingsPage';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/studies" replace />} />
        <Route path="/studies" element={<div className="animate-fade-in"><StudyListPage /></div>} />
        <Route path="/viewer" element={<div className="animate-fade-in"><ViewerPage /></div>} />
        <Route path="/viewer/:studyId" element={<div className="animate-fade-in"><ViewerPage /></div>} />
        <Route path="/report" element={<div className="animate-fade-in"><ReportPage /></div>} />
        <Route path="/report/:studyId" element={<div className="animate-fade-in"><ReportPage /></div>} />
        <Route path="/consultation" element={<div className="animate-fade-in"><ConsultationPage /></div>} />
        <Route path="/consultation/:id" element={<div className="animate-fade-in"><ConsultationPage /></div>} />
        <Route path="/quality" element={<div className="animate-fade-in"><QualityPage /></div>} />
        <Route path="/archive" element={<div className="animate-fade-in"><ArchivePage /></div>} />
        <Route path="/settings" element={<div className="animate-fade-in"><SettingsPage /></div>} />
      </Routes>
    </Layout>
  );
}
