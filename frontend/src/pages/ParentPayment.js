import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getParentInvoices, createParentPayment } from '../api/api';

function ParentPayment() {
    const { invoiceId } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form states
    const [channel, setChannel] = useState('bank');
    const [amount, setAmount] = useState('');
    const [bankReference, setBankReference] = useState('');
    const [screenshot, setScreenshot] = useState(null);

    const token = localStorage.getItem('parentToken');

    useEffect(() => {
        if (!token) {
            navigate('/parent/login');
            return;
        }
        loadInvoice();
    }, [invoiceId, token, navigate]);

    const loadInvoice = async () => {
        try {
            const res = await getParentInvoices();
            const inv = res.data.find(i => i.id === parseInt(invoiceId));
            if (inv) {
                setInvoice(inv);
                setAmount(inv.amount_due);
            } else {
                setMessage('Invoice not found.');
                setMessageType('error');
            }
        } catch (err) {
            setMessage('Error loading invoice.');
            setMessageType('error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('invoice', invoiceId);
            formData.append('amount_paid', amount);
            formData.append('channel', channel);
            formData.append('status', 'pending');

            if (channel === 'cash') {
                // For cash, just submit (though this shouldn't happen on parent portal)
                formData.append('bank_reference', 'Cash payment');
            } else if (channel === 'bank') {
                if (!bankReference.trim()) {
                    setMessage('Please enter the bank transaction reference.');
                    setMessageType('error');
                    setIsSubmitting(false);
                    return;
                }
                formData.append('bank_reference', bankReference);
            } else if (channel === 'mobile') {
                if (!bankReference.trim() && !screenshot) {
                    setMessage('Please enter a reference number or upload a screenshot.');
                    setMessageType('error');
                    setIsSubmitting(false);
                    return;
                }
                if (bankReference) formData.append('bank_reference', bankReference);
                if (screenshot) formData.append('receipt_image', screenshot);
            }

            await createParentPayment(formData);

            setMessage('✓ Payment proof submitted successfully! The school will verify and confirm within 24 hours.');
            setMessageType('success');

            setTimeout(() => {
                navigate('/parent/dashboard');
            }, 2000);
        } catch (err) {
            setMessage(err.response?.data?.detail || 'Error submitting payment.');
            setMessageType('error');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <p style={{ padding: '2rem' }}>Loading...</p>;
    if (!invoice) return <p style={{ padding: '2rem' }}>Invoice not found.</p>;

    return (
        <div style={{
            minHeight: '100vh', background: '#f5f5f5', padding: '2rem'
        }}>
            {/* Back button */}
            <button
                onClick={() => navigate('/parent/dashboard')}
                style={{
                    background: 'none', border: 'none', color: '#1F6BB0',
                    cursor: 'pointer', fontSize: '14px', marginBottom: '1rem'
                }}
            >
                ← Back to Dashboard
            </button>

            <div style={{ maxWidth: '500px', margin: '0 auto' }}>

                {/* Invoice details card */}
                <div style={cardStyle}>
                    <h2 style={{ color: '#1F6BB0', marginTop: 0 }}>Payment for Invoice</h2>

                    <div style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem' }}>
                        <div style={detailRowStyle}>
                            <span style={{ color: '#666' }}>Invoice Reference:</span>
                            <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '16px' }}>
                                {invoice.reference_code}
                            </span>
                        </div>
                        <div style={detailRowStyle}>
                            <span style={{ color: '#666' }}>Month:</span>
                            <span style={{ fontWeight: '500' }}>{invoice.month}</span>
                        </div>
                        <div style={{ ...detailRowStyle, borderTop: '1px solid #ddd', paddingTop: '10px' }}>
                            <span style={{ color: '#666' }}>Amount Due:</span>
                            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#2E7D32' }}>
                                {Number(invoice.amount_due).toLocaleString()} ETB
                            </span>
                        </div>
                    </div>

                    {message && (
                        <p style={{
                            background: messageType === 'success' ? '#e8f5e9' : '#ffebee',
                            color: messageType === 'success' ? '#2e7d32' : '#c62828',
                            padding: '10px', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '14px'
                        }}>
                            {message}
                        </p>
                    )}

                    {/* Payment form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        {/* Channel selection */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                                How did you pay?
                            </label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        value="bank"
                                        checked={channel === 'bank'}
                                        onChange={e => setChannel(e.target.value)}
                                    />
                                    <span style={{ fontSize: '14px' }}>🏦 Bank (in person)</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        value="mobile"
                                        checked={channel === 'mobile'}
                                        onChange={e => setChannel(e.target.value)}
                                    />
                                    <span style={{ fontSize: '14px' }}>📱 Mobile Banking</span>
                                </label>
                            </div>
                        </div>

                        {/* Amount */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                                Amount Paid (ETB)
                            </label>
                            <input
                                style={inputStyle}
                                type="number"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                required
                            />
                        </div>

                        {/* Bank reference */}
                        {channel === 'bank' && (
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                                    Bank Transaction Reference
                                </label>
                                <p style={{ fontSize: '12px', color: '#666', margin: '0 0 8px' }}>
                                    (The reference number from your bank receipt)
                                </p>
                                <input
                                    style={inputStyle}
                                    placeholder="e.g. TXN123456789"
                                    value={bankReference}
                                    onChange={e => setBankReference(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        {channel === 'mobile' && (
                            <>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                                        Transaction Reference (optional)
                                    </label>
                                    <p style={{ fontSize: '12px', color: '#666', margin: '0 0 8px' }}>
                                        (The reference number from your mobile banking app)
                                    </p>
                                    <input
                                        style={inputStyle}
                                        placeholder="e.g. REF123456"
                                        value={bankReference}
                                        onChange={e => setBankReference(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                                        Screenshot of Transfer (optional)
                                    </label>
                                    <p style={{ fontSize: '12px', color: '#666', margin: '0 0 8px' }}>
                                        (Upload a screenshot showing the payment confirmation)
                                    </p>
                                    <input
                                        style={inputStyle}
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setScreenshot(e.target.files[0])}
                                    />
                                    {screenshot && (
                                        <p style={{ fontSize: '12px', color: '#2e7d32', margin: '6px 0' }}>
                                            ✓ {screenshot.name} selected
                                        </p>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Instructions box */}
                        <div style={{
                            background: '#e3f2fd', padding: '12px', borderRadius: '6px',
                            border: '1px solid #90caf9', marginBottom: '1rem'
                        }}>
                            <p style={{ fontSize: '13px', color: '#1565c0', margin: 0 }}>
                                <strong>ℹ️ Please note:</strong> Make sure you included your child's name, grade, and month in the payment description at the bank.
                            </p>
                        </div>

                        {/* Submit button */}
                        <button
                            style={{
                                ...buttonStyle,
                                opacity: isSubmitting ? 0.6 : 1,
                                cursor: isSubmitting ? 'not-allowed' : 'pointer'
                            }}
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Payment Proof'}
                        </button>
                    </form>

                </div>

            </div>
        </div>
    );
}

const cardStyle = {
    background: 'white', border: '1px solid #ddd',
    borderRadius: '8px', padding: '2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
};

const detailRowStyle = {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '8px 0', marginBottom: '8px'
};

const inputStyle = {
    width: '100%', padding: '10px', borderRadius: '6px',
    border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box'
};

const buttonStyle = {
    padding: '12px', background: '#1F6BB0', color: 'white',
    border: 'none', borderRadius: '6px', cursor: 'pointer',
    fontSize: '14px', fontWeight: '500', width: '100%'
};

export default ParentPayment;