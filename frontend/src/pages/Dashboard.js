import React, { useState, useEffect } from 'react';
import { getStudents, getInvoices, getPayments } from '../api/api';

function Dashboard() {
    const [students, setStudents] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [studentsRes, invoicesRes, paymentsRes] = await Promise.all([
                getStudents(),
                getInvoices(),
                getPayments()
            ]);
            setStudents(studentsRes.data);
            setInvoices(invoicesRes.data);
            setPayments(paymentsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Loading...</p>;

    // Calculate stats
    const totalStudents = students.length;
    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum, inv) => sum + parseFloat(inv.amount_due), 0);
    const confirmedPayments = payments.filter(p => p.status === 'confirmed');
    const collectedAmount = confirmedPayments.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);
    const pendingPayments = payments.filter(p => p.status === 'pending');
    const outstandingAmount = totalAmount - collectedAmount;
    const collectionRate = totalAmount > 0 ? Math.round((collectedAmount / totalAmount) * 100) : 0;

    // Recent confirmed payments
    const recentPayments = confirmedPayments.sort((a, b) =>
        new Date(b.verified_at) - new Date(a.verified_at)
    ).slice(0, 5);

    return (
        <div>
            <h2 style={{ color: '#1F6BB0', marginBottom: '2rem' }}>Dashboard</h2>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

                {/* Total Students */}
                <div style={statCardStyle}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1F6BB0' }}>
                        {totalStudents}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                        Total Students
                    </div>
                </div>

                {/* Total Invoices */}
                <div style={statCardStyle}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2E7D32' }}>
                        {totalInvoices}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                        Total Invoices
                    </div>
                </div>

                {/* Amount Due */}
                <div style={statCardStyle}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#F57F17' }}>
                        {Number(totalAmount).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                        Total Amount Due (ETB)
                    </div>
                </div>

                {/* Amount Collected */}
                <div style={statCardStyle}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2E7D32' }}>
                        {Number(collectedAmount).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                        Amount Collected (ETB)
                    </div>
                </div>

                {/* Outstanding */}
                <div style={statCardStyle}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#C62828' }}>
                        {Number(outstandingAmount).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                        Outstanding (ETB)
                    </div>
                </div>

                {/* Collection Rate */}
                <div style={statCardStyle}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1F6BB0' }}>
                        {collectionRate}%
                    </div>
                    <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
                        Collection Rate
                    </div>
                </div>

            </div>

            {/* Quick Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

                {/* Pending Verification Alert */}
                <div style={cardStyle}>
                    <h3 style={{ color: '#F57F17', margin: '0 0 12px' }}>
                        ⚠️ Pending Verification
                    </h3>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#F57F17' }}>
                        {pendingPayments.length}
                    </div>
                    <p style={{ fontSize: '13px', color: '#666', margin: '8px 0 0' }}>
                        Payment proofs waiting to be checked
                    </p>
                </div>

                {/* Unpaid Invoices */}
                <div style={cardStyle}>
                    <h3 style={{ color: '#C62828', margin: '0 0 12px' }}>
                        📋 Unpaid Invoices
                    </h3>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#C62828' }}>
                        {invoices.filter(inv => inv.status === 'unpaid').length}
                    </div>
                    <p style={{ fontSize: '13px', color: '#666', margin: '8px 0 0' }}>
                        Students with no payment submitted yet
                    </p>
                </div>

                {/* Confirmed This Session */}
                <div style={cardStyle}>
                    <h3 style={{ color: '#2E7D32', margin: '0 0 12px' }}>
                        ✓ Confirmed Payments
                    </h3>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2E7D32' }}>
                        {confirmedPayments.length}
                    </div>
                    <p style={{ fontSize: '13px', color: '#666', margin: '8px 0 0' }}>
                        Total verified and marked as paid
                    </p>
                </div>

            </div>

            {/* Recent Confirmed Payments */}
            <div style={cardStyle}>
                <h3 style={{ marginTop: 0 }}>Recent Confirmed Payments</h3>
                {recentPayments.length === 0 ? (
                    <p style={{ color: '#888' }}>No confirmed payments yet.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f5f5f5' }}>
                                <th style={thStyle}>Invoice</th>
                                <th style={thStyle}>Amount</th>
                                <th style={thStyle}>Channel</th>
                                <th style={thStyle}>Verified By</th>
                                <th style={thStyle}>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentPayments.map((p, i) => (
                                <tr key={p.id} style={{ borderTop: '1px solid #eee' }}>
                                    <td style={tdStyle}>
                                        <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                                            {invoices.find(inv => inv.id === p.invoice)?.reference_code || '—'}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>{Number(p.amount_paid).toLocaleString()} ETB</td>
                                    <td style={tdStyle}>{getChannelLabel(p.channel)}</td>
                                    <td style={tdStyle}>{p.verified_by || '—'}</td>
                                    <td style={tdStyle}>
                                        {p.verified_at ? new Date(p.verified_at).toLocaleDateString() : '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

        </div>
    );
}

const getChannelLabel = (channel) => {
    if (channel === 'cash') return '💵 Cash';
    if (channel === 'bank') return '🏦 Bank';
    return '📱 Mobile';
};

const statCardStyle = {
    background: 'white', border: '1px solid #ddd',
    borderRadius: '8px', padding: '1.5rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
};

const cardStyle = {
    background: 'white', border: '1px solid #ddd',
    borderRadius: '8px', padding: '1.5rem',
    marginBottom: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
};

const thStyle = { padding: '10px', textAlign: 'left', fontSize: '13px', fontWeight: '500' };
const tdStyle = { padding: '10px', fontSize: '13px' };

export default Dashboard;