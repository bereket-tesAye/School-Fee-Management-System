import React, { useState, useEffect } from 'react';
import { getInvoices, getStudents, createInvoice } from '../api/api';

function Invoices() {
    const [invoices, setInvoices] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    // Form states
    const [selectedStudent, setSelectedStudent] = useState('');
    const [amount, setAmount] = useState('');
    const [month, setMonth] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [invoicesRes, studentsRes] = await Promise.all([
                getInvoices(),
                getStudents()
            ]);
            setInvoices(invoicesRes.data);
            setStudents(studentsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Generate a unique reference code
    const generateReference = () => {
        const timestamp = Date.now().toString().slice(-4);
        return `SCH-${new Date().getFullYear()}-${timestamp}`;
    };

    const handleCreateInvoice = async (e) => {
        e.preventDefault();
        try {
            await createInvoice({
                student: selectedStudent,
                amount_due: amount,
                month: month,
                reference_code: generateReference(),
                status: 'unpaid'
            });
            setSelectedStudent('');
            setAmount('');
            setMonth('');
            setMessage('Invoice created successfully!');
            loadData();
        } catch (err) {
            setMessage('Error creating invoice.');
            console.error(err);
        }
    };

    const getStatusStyle = (status) => {
        if (status === 'paid') return { background: '#e8f5e9', color: '#2e7d32', padding: '4px 10px', borderRadius: '12px', fontSize: '13px' };
        if (status === 'pending') return { background: '#fff8e1', color: '#f57f17', padding: '4px 10px', borderRadius: '12px', fontSize: '13px' };
        return { background: '#ffebee', color: '#c62828', padding: '4px 10px', borderRadius: '12px', fontSize: '13px' };
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h2 style={{ color: '#1F6BB0' }}>Invoices</h2>

            {message && (
                <p style={{ background: '#e8f5e9', color: '#2e7d32', padding: '10px', borderRadius: '6px' }}>
                    {message}
                </p>
            )}

            {/* Create Invoice Form */}
            <div style={cardStyle}>
                <h3>Create Invoice</h3>
                <form onSubmit={handleCreateInvoice} style={formStyle}>
                    <select
                        style={inputStyle}
                        value={selectedStudent}
                        onChange={e => setSelectedStudent(e.target.value)}
                        required
                    >
                        <option value="">Select a student</option>
                        {students.map(s => (
                            <option key={s.id} value={s.id}>
                                {s.full_name} — {s.student_class ? s.student_class.name : 'No class'}
                            </option>
                        ))}
                    </select>

                    <input
                        style={inputStyle}
                        type="number"
                        placeholder="Amount due (ETB)"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        required
                    />

                    <input
                        style={inputStyle}
                        placeholder="Month (e.g. July 2026)"
                        value={month}
                        onChange={e => setMonth(e.target.value)}
                        required
                    />

                    <button style={buttonStyle} type="submit">Create Invoice</button>
                </form>
            </div>

            {/* Invoices List */}
            <div style={cardStyle}>
                <h3>All Invoices ({invoices.length})</h3>
                {invoices.length === 0 ? (
                    <p style={{ color: '#888' }}>No invoices created yet.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#1F6BB0', color: 'white' }}>
                                <th style={thStyle}>Reference</th>
                                <th style={thStyle}>Student</th>
                                <th style={thStyle}>Month</th>
                                <th style={thStyle}>Amount</th>
                                <th style={thStyle}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((inv, i) => (
                                <tr key={inv.id} style={{ background: i % 2 === 0 ? '#f5f5f5' : 'white' }}>
                                    <td style={tdStyle}>
                                        <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                                            {inv.reference_code}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>{inv.student_name}</td>
                                    <td style={tdStyle}>{inv.month}</td>
                                    <td style={tdStyle}>{Number(inv.amount_due).toLocaleString()} ETB</td>
                                    <td style={tdStyle}>
                                        <span style={getStatusStyle(inv.status)}>
                                            {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                                        </span>
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

const cardStyle = {
    background: 'white', border: '1px solid #ddd',
    borderRadius: '8px', padding: '1.5rem',
    marginBottom: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
};
const formStyle = { display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' };
const inputStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' };
const buttonStyle = {
    padding: '10px', background: '#1F6BB0', color: 'white',
    border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px'
};
const thStyle = { padding: '10px', textAlign: 'left' };
const tdStyle = { padding: '10px', borderTop: '1px solid #eee' };

export default Invoices;