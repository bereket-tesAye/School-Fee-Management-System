import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getParentInvoices, getParentPayments } from '../api/api';

function ParentDashboard() {
    const [invoices, setInvoices] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const token = localStorage.getItem('parentToken');
    const parentName = localStorage.getItem('parentName');

    useEffect(() => {
        if (!token) {
            navigate('/parent/login');
            return;
        }
        loadData();
    }, [token, navigate]);

    const loadData = async () => {
        try {
            const [invoicesRes, paymentsRes] = await Promise.all([
                getParentInvoices(),
                getParentPayments()
            ]);
            setInvoices(invoicesRes.data);
            setPayments(paymentsRes.data);
        } catch (err) {
            setMessage('Error loading data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('parentToken');
        localStorage.removeItem('parentId');
        localStorage.removeItem('parentName');
        localStorage.removeItem('guardianId');
        navigate('/parent/login');
    };

    if (loading) return <p>Loading...</p>;

    // Calculate totals
    const totalDue = invoices.reduce((sum, inv) => sum + parseFloat(inv.amount_due), 0);
    const totalPaid = payments
        .filter(p => p.status === 'confirmed')
        .reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);
    const unpaidInvoices = invoices.filter(inv => inv.status !== 'paid');

    return (
        <div>
            {/* Navbar */}
            <nav style={{
                background: '#1F6BB0', padding: '1rem 2rem',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                color: 'white'
            }}>
                <div>
                    <span style={{ fontWeight: 'bold', fontSize: '18px' }}>School Fees</span>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.9 }}>
                        Welcome, {parentName}
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        background: 'rgba(255,255,255,0.2)', color: 'white',
                        border: '1px solid white', padding: '8px 16px',
                        borderRadius: '4px', cursor: 'pointer', fontSize: '13px'
                    }}
                >
                    Logout
                </button>
            </nav>

            <div style={{ padding: '2rem' }}>

                <h2 style={{ color: '#1F6BB0', marginBottom: '1.5rem' }}>Your Child's Fees</h2>

                {message && (
                    <p style={{
                        background: '#ffebee', color: '#c62828',
                        padding: '10px', borderRadius: '6px', marginBottom: '1rem'
                    }}>
                        {message}
                    </p>
                )}

                {/* Summary cards */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1.5rem', marginBottom: '2rem'
                }}>
                    <div style={summaryCardStyle}>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1F6BB0' }}>
                            {Number(totalDue).toLocaleString()}
                        </div>
                        <div style={{ fontSize: '13px', color: '#666', marginTop: '8px' }}>
                            Total Amount Due
                        </div>
                    </div>

                    <div style={summaryCardStyle}>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2E7D32' }}>
                            {Number(totalPaid).toLocaleString()}
                        </div>
                        <div style={{ fontSize: '13px', color: '#666', marginTop: '8px' }}>
                            Amount Paid
                        </div>
                    </div>

                    <div style={summaryCardStyle}>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#F57F17' }}>
                            {unpaidInvoices.length}
                        </div>
                        <div style={{ fontSize: '13px', color: '#666', marginTop: '8px' }}>
                            Outstanding Invoices
                        </div>
                    </div>
                </div>

                {/* Outstanding invoices */}
                <div style={cardStyle}>
                    <h3>Outstanding Invoices</h3>
                    {unpaidInvoices.length === 0 ? (
                        <p style={{ color: '#2e7d32', background: '#e8f5e9', padding: '12px', borderRadius: '6px' }}>
                            ✓ All invoices are paid. Thank you!
                        </p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f5f5f5' }}>
                                    <th style={thStyle}>Reference Code</th>
                                    <th style={thStyle}>Month</th>
                                    <th style={thStyle}>Amount</th>
                                    <th style={thStyle}>Status</th>
                                    <th style={thStyle}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {unpaidInvoices.map((inv, i) => (
                                    <tr key={inv.id} style={{ borderTop: '1px solid #eee' }}>
                                        <td style={tdStyle}>
                                            <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                                                {inv.reference_code}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>{inv.month}</td>
                                        <td style={tdStyle}>{Number(inv.amount_due).toLocaleString()} ETB</td>
                                        <td style={tdStyle}>
                                            <span style={{
                                                background: inv.status === 'pending' ? '#fff8e1' : '#ffebee',
                                                color: inv.status === 'pending' ? '#f57f17' : '#c62828',
                                                padding: '4px 10px', borderRadius: '12px', fontSize: '12px'
                                            }}>
                                                {inv.status === 'pending' ? 'Pending' : 'Unpaid'}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            <button
                                                onClick={() => navigate(`/parent/pay/${inv.id}`)}
                                                style={{
                                                    background: '#1F6BB0', color: 'white',
                                                    border: 'none', padding: '6px 12px',
                                                    borderRadius: '4px', cursor: 'pointer', fontSize: '12px'
                                                }}
                                            >
                                                Pay Now
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Payment history */}
                <div style={cardStyle}>
                    <h3>Payment History</h3>
                    {payments.length === 0 ? (
                        <p style={{ color: '#888' }}>No payments submitted yet.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f5f5f5' }}>
                                    <th style={thStyle}>Invoice</th>
                                    <th style={thStyle}>Amount</th>
                                    <th style={thStyle}>Channel</th>
                                    <th style={thStyle}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((p, i) => (
                                    <tr key={p.id} style={{ borderTop: '1px solid #eee' }}>
                                        <td style={tdStyle}>
                                            <span style={{ fontFamily: 'monospace' }}>
                                                {invoices.find(inv => inv.id === p.invoice)?.reference_code || '—'}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>{Number(p.amount_paid).toLocaleString()} ETB</td>
                                        <td style={tdStyle}>{getChannelLabel(p.channel)}</td>
                                        <td style={tdStyle}>
                                            <span style={{
                                                background: p.status === 'confirmed' ? '#e8f5e9' : '#fff8e1',
                                                color: p.status === 'confirmed' ? '#2e7d32' : '#f57f17',
                                                padding: '4px 10px', borderRadius: '12px', fontSize: '12px'
                                            }}>
                                                {p.status === 'confirmed' ? '✓ Confirmed' : '⏳ Pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

            </div>
        </div>
    );
}

const getChannelLabel = (channel) => {
    if (channel === 'cash') return '💵 Cash';
    if (channel === 'bank') return '🏦 Bank';
    return '📱 Mobile';
};

const summaryCardStyle = {
    background: 'white', border: '1px solid #ddd',
    borderRadius: '8px', padding: '1.5rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
};

const cardStyle = {
    background: 'white', border: '1px solid #ddd',
    borderRadius: '8px', padding: '1.5rem',
    marginBottom: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
};

const thStyle = { padding: '10px', textAlign: 'left', fontSize: '13px' };
const tdStyle = { padding: '10px', fontSize: '13px' };

export default ParentDashboard;