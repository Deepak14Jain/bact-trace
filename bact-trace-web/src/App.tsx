import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import DoctorView from './DoctorView';
import GovernmentDashboard from './GovernmentDashboard';
import LandingPage from './LandingPage';

// --- 1. Navigation Wrapper ---
const LandingWrapper = () => {
  const navigate = useNavigate();
  return (
    <LandingPage 
      onEnterApp={() => navigate('/doctor')} 
      onEnterGov={() => navigate('/gov')} // ✅ Pass the Gov navigation
    />
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root Path -> Landing Page */}
        <Route path="/" element={<LandingWrapper />} />
        
        {/* Doctor Interface */}
        <Route path="/doctor" element={<DoctorView />} />

        {/* Government Dashboard */}
        <Route path="/gov" element={<GovernmentDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;