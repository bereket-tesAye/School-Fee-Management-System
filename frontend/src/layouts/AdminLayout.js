import React from 'react';
import { Link } from 'react-router-dom';

function AdminLayout({ children }) {
    return (
        <div style={{ fontFamily: 'Arial, sans-serif' }}>
            <nav style={{
                background: '#1F6BB0', padding: '1rem 2rem',
                display: 'flex', gap: '2rem', alignItems: 'center'
            }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>
                    School Fees — Admin
                </span>
                <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
                <Link to="/students" style={{ color: 'white', textDecoration: 'none' }}>Students</Link>
                <Link to="/invoices" style={{ color: 'white', textDecoration: 'none' }}>Invoices</Link>
                <Link to="/payments" style={{ color: 'white', textDecoration: 'none' }}>Payments</Link>
                <Link to="/parent/login" style={{ color: 'white', textDecoration: 'none', marginLeft: 'auto' }}>
                    Parent Login
                </Link>
            </nav>
            <div style={{ padding: '2rem' }}>
                {children}
            </div>
        </div>
    );
}

export default AdminLayout;