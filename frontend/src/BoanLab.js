// src/BoanLab.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AllLog from './pages/AllLog';
import KeyManagementLog from './pages/KeyManagementLog';
import Topology from './pages/Topology';

const BoanLab = () => {
  return (
    <Router>
      <Routes>
        <Route path="/alllog" element={<AllLog />} />
        <Route path="/keymanagementlog" element={<KeyManagementLog />} />
        <Route path="/" element={<Topology />} />
        {/* Add other routes as needed */}
      </Routes>
    </Router>
  );
}

export default BoanLab;
