import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import DashboardAdmin from './DashboardAdmin';
import DashboardClient from './DashboardClient';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<DashboardAdmin />} />
        <Route path="/client" element={<DashboardClient />} />
      </Routes>
    </Router>
  );
}

export default App;
