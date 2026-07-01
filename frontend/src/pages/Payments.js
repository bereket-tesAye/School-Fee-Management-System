import React, { useState, useEffect } from 'react';
import { getPayments, getInvoices, createPayment, confirmPayment, rejectPayment } from '../api/api';

function Payments() {
    const [payments, setPayments] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');

    // Form states
    const [selectedInvoice, setSelectedInvoice] = useState('');
    const [amount, setAmount] = useState('');
    const [channel, setChannel] = useState('cash');
    const [bankReference, setBankReference] = useState('');
    const [receiptImage, setReceiptImage] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [paymentsRes, invoicesRes] = await Promise.all([
                getPayments(),
                getInvoices()
            ]);
            setPayments(paymentsRes.data);
            setInvoices(invoicesRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (text, type = 'success') => {
        setMessage(text);
        setMessageType(type);
        setTimeout(() => setMessage(''), 4000);
    };

    const handleSubmitPayment = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('invoice', selectedInvoice);
            formData.append('amount_paid', amount);
            formData.append('channel', channel);
            formData.append('bank_reference', bankReference);
            formData.append('status', channel === 'cash' ? 'confirmed' : 'pending');
            if (receiptImage) formData.append('receipt_image', receiptImage);

            await createPayment(formData);

            // If cash, also mark invoice as paid immediately
            if (channel === 'cash') {
                const invoice = invoices.find(inv => inv.id === parseInt(selectedInvoice));
                if (invoice) {
                    await confirmPayment(
                        (await createPayment(formData)).data.id,
                        { verified_by: 'Staff' }
                    );
                }
                showMessage('Cash payment recorded and marked as paid!');
            } else {
                showMessage('Payment proof submitted — waiting for verification.');
            }

            setSelectedInvoice('');
            setAmount('');
            setChannel('cash');
            setBankReference('');
            setReceiptImage(null);
            loadData();
        } catch (err) {
            showMessage('Error submitting payment.', 'error');
            console.error(err);
        }
    };

    const handleConfirm = async (paymentId) => {
        try {
            await confirmPayment(paymentId, { verified_by: 'Admin' });
            showMessage('Payment confirmed and invoice marked as paid!');
            loadData();
        } catch (err) {
            showMessage('Error confirming payment.', 'error');
        }
    };

    const handleReject = async (paymentId) => {
        try {
            await rejectPayment(paymentId, { verified_by: 'Admin' });
            showMessage('Payment rejected.', 'error');
            loadData();
        } catch (err) {
            showMessage('Error rejecting payment.', 'error');
        }
    };

    const pendingPayments = payments.filter(p => p.status === 'pending');
    const confirmedPayments = payments.filter(p => p.status === 'confirmed');

    const getStatusStyle = (status) => {
        if (status === 'confirmed') return { background: '#e8f5e9', color: '#2e7d32', padding: '4px 10px', borderRadius: '12px', fontSize: '13px' };
        if (status === 'pending') return { background: '#fff8e1', color: '#f57f17', padding: '4px 10px', borderRadius: '12px', fontSize: '13px' };
        return { background: '#ffebee', color: '#c62828', padding: '4px 10px', borderRadius: '12px', fontSize: '13px' };
    };

    const getChannelLabel = (channel) => {
        if (channel === 'cash') return '💵 Cash';
        if (channel === 'bank') return '🏦 Bank Receipt';
        return '📱 Mobile Banking';
    };

    if (loading) return <p>Loading...</p>;

    // Unpaid invoices only — no point paying a paid invoice
    const unpaidInvoices = invoices.filter(inv => inv.status !== 'paid');

    return (
        <div>
            <h2 style={{ color: '#1F6BB0' }}>Payments</h2>

            {message && (
                <p style={{
                    background: messageType === 'success' ? '#e8f5e9' : '#ffebee',
                    color: messageType === 'success' ? '#2e7d32' : '#c62828',
                    padding: '10px', borderRadius: '6px'
                }}>
                    {message}
                </p>
            )}

            {/* Submit Payment Form */}
            <div style={cardStyle}>
                <h3>Record a Payment</h3>
                <form onSubmit={handleSubmitPayment} style={formStyle}>

                    <select
                        style={inputStyle}
                        value={selectedInvoice}
                        onChange={e => setSelectedInvoice(e.target.value)}
                        required
                    >
                        <option value="">Select an invoice</option>
                        {unpaidInvoices.map(inv => (
                            <option key={inv.id} value={inv.id}>
                                {inv.reference_code} — {inv.student_name} — {inv.month} — {Number(inv.amount_due).toLocaleString()} ETB
                            </option>
                        ))}
                    </select>

                    <input
                        style={inputStyle}
                        type="number"
                        placeholder="Amount paid (ETB)"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        required
                    />

                    <select
                        style={inputStyle}
                        value={channel}
                        onChange={e => setChannel(e.target.value)}
                    >
                        <option value="cash">💵 Cash at school</option>
                        <option value="bank">🏦 Bank receipt</option>
                        <option value="mobile">📱 Mobile banking</option>
                    </select>

                    {/* Only show these fields if not cash */}
                    {channel !== 'cash' && (
                        <>
                            <input
                                style={inputStyle}
                                placeholder="Bank / transaction reference number"
                                value={bankReference}
                                onChange={e => setBankReference(e.target.value)}
                            />
                            <div>
                                <label style={{ fontSize: '13px', color: '#555' }}>
                                    Attach receipt or screenshot
                                </label>
                                <input
                                    style={{ ...inputStyle, marginTop: '6px' }}
                                    type="file"
                                    accept="image/*"
                                    onChange={e => setReceiptImage(e.target.files[0])}
                                />
                            </div>
                        </>
                    )}

                    <button style={buttonStyle} type="submit">
                        {channel === 'cash' ? 'Record Cash Payment' : 'Submit Payment Proof'}
                    </button>
                </form>
            </div>

            {/* Pending Verification */}
            <div style={cardStyle}>
                <h3>
                    Pending Verification
                    {pendingPayments.length > 0 && (
                        <span style={{
                            background: '#f57f17', color: 'white',
                            borderRadius: '50%', padding: '2px 8px',
                            fontSize: '13px', marginLeft: '10px'
                        }}>
                            {pendingPayments.length}
                        </span>
                    )}
                </h3>
                {pendingPayments.length === 0 ? (
                    <p style={{ color: '#888' }}>No payments waiting for verification.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f57f17', color: 'white' }}>
                                <th style={thStyle}>Invoice Ref</th>
                                <th style={thStyle}>Channel</th>
                                <th style={thStyle}>Amount</th>
                                <th style={thStyle}>Bank Ref</th>
                                <th style={thStyle}>Receipt</th>
                                <th style={thStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingPayments.map((p, i) => (
                                <tr key={p.id} style={{ background: i % 2 === 0 ? '#fff8e1' : 'white' }}>
                                    <td style={tdStyle}>
                                        <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                                            {invoices.find(inv => inv.id === p.invoice)?.reference_code || '—'}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>{getChannelLabel(p.channel)}</td>
                                    <td style={tdStyle}>{Number(p.amount_paid).toLocaleString()} ETB</td>
                                    <td style={tdStyle}>{p.bank_reference || '—'}</td>
                                    <td style={tdStyle}>
                                        {p.receipt_image ? (
                                            <a href={`http://127.0.0.1:8000${p.receipt_image}`}
                                                target="_blank" rel="noreferrer"
                                                style={{ color: '#1F6BB0' }}>
                                                View
                                            </a>
                                        ) : '—'}
                                    </td>
                                    <td style={tdStyle}>
                                        <button
                                            onClick={() => handleConfirm(p.id)}
                                            style={{ ...buttonStyle, padding: '6px 12px', marginRight: '8px', background: '#2e7d32' }}
                                        >
                                            Confirm ✓
                                        </button>
                                        <button
                                            onClick={() => handleReject(p.id)}
                                            style={{ ...buttonStyle, padding: '6px 12px', background: '#c62828' }}
                                        >
                                            Reject ✗
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Confirmed Payments */}
            <div style={cardStyle}>
                <h3>Confirmed Payments ({confirmedPayments.length})</h3>
                {confirmedPayments.length === 0 ? (
                    <p style={{ color: '#888' }}>No confirmed payments yet.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#1F6BB0', color: 'white' }}>
                                <th style={thStyle}>Invoice Ref</th>
                                <th style={thStyle}>Channel</th>
                                <th style={thStyle}>Amount</th>
                                <th style={thStyle}>Verified By</th>
                                <th style={thStyle}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {confirmedPayments.map((p, i) => (
                                <tr key={p.id} style={{ background: i % 2 === 0 ? '#f5f5f5' : 'white' }}>
                                    <td style={tdStyle}>
                                        <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                                            {invoices.find(inv => inv.id === p.invoice)?.reference_code || '—'}
                                        </span>
                                    </td>
                                    <td style={tdStyle}>{getChannelLabel(p.channel)}</td>
                                    <td style={tdStyle}>{Number(p.amount_paid).toLocaleString()} ETB</td>
                                    <td style={tdStyle}>{p.verified_by || '—'}</td>
                                    <td style={tdStyle}>
                                        <span style={getStatusStyle(p.status)}>
                                            {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
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
const formStyle = { display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '420px' };
const inputStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px' };
const buttonStyle = {
    padding: '10px', background: '#1F6BB0', color: 'white',
    border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px'
};
const thStyle = { padding: '10px', textAlign: 'left' };
const tdStyle = { padding: '10px', borderTop: '1px solid #eee' };

export default Payments;