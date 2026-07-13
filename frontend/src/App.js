import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import ParentLayout from './layouts/ParentLayout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Invoices from './pages/Invoices';
import Payments from './pages/Payments';
import ParentLogin from './pages/ParentLogin';
import ParentDashboard from './pages/ParentDashboard';
import ParentPayment from './pages/ParentPayment';

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin routes */}
        <Route path="/" element={<AdminLayout><Dashboard /></AdminLayout>} />
        <Route path="/students" element={<AdminLayout><Students /></AdminLayout>} />
        <Route path="/invoices" element={<AdminLayout><Invoices /></AdminLayout>} />
        <Route path="/payments" element={<AdminLayout><Payments /></AdminLayout>} />

        {/* Parent routes */}
        <Route path="/parent/login" element={<ParentLogin />} />
        <Route path="/parent/dashboard" element={<ParentLayout><ParentDashboard /></ParentLayout>} />
        <Route path="/parent/pay/:invoiceId" element={<ParentLayout><ParentPayment /></ParentLayout>} />
      </Routes>
    </Router>
  );
}

export default App;