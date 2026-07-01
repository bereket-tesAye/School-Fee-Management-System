import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Students from './pages/Students';
import Invoices from './pages/Invoices';
import Payments from './pages/Payments';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <div style={{ fontFamily: 'Arial, sans-serif' }}>

        {/* Navigation bar */}
        <nav style={{
          background: '#1F6BB0', padding: '1rem 2rem',
          display: 'flex', gap: '2rem', alignItems: 'center'
        }}>
          <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>
            School Fees
          </span>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
          <Link to="/students" style={{ color: 'white', textDecoration: 'none' }}>Students</Link>
          <Link to="/invoices" style={{ color: 'white', textDecoration: 'none' }}>Invoices</Link>
          <Link to="/payments" style={{ color: 'white', textDecoration: 'none' }}>Payments</Link>
        </nav>

        {/* Pages */}
        <div style={{ padding: '2rem' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/payments" element={<Payments />} />
          </Routes>
        </div>

      </div>
    </Router>
  );
}

export default App;