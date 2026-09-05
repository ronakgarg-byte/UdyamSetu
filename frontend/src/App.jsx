import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import WelcomePage from './pages/WelcomePage';
import PortalSelectPage from './pages/PortalSelectPage';
import UserDetailsPage from './pages/UserDetailsPage';
import QuestionnairePage from './pages/QuestionnairePage';
import ItemsPage from './pages/ItemsPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/portal-select" element={<PortalSelectPage />} />
          <Route path="/details" element={<UserDetailsPage />} />
          <Route path="/questionnaire" element={<QuestionnairePage />} />
          <Route path="/items" element={<ItemsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}
