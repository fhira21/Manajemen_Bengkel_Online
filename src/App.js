import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/Login';
import DashboardAdmin from './pages/admin/DasboardAdmin';
import DashboardMontir from './pages/montir/DashboardMontir';

function App() {
  return <MainLayout />;
}

function MainLayout() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboardadmin" element={<DashboardAdmin />} />
      <Route path="/dashboardmontir" element={<DashboardMontir />} />
    </Routes>
  );
}

export default App;