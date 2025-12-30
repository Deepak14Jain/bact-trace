import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DoctorView from './DoctorView';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect home to Doctor View for the Demo */}
        <Route path="/" element={<Navigate to="/doctor" replace />} />
        
        {/* The Main App Interface */}
        <Route path="/doctor" element={<DoctorView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;