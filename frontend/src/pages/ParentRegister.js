import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { parentRegister } from '../api/api';
import { getGuardians } from '../api/api';

function ParentRegister() {
    const [guardians, setGuardians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [selectedGuardian, setSelectedGuardian] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('error');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadGuardians();
    }, []);

    const loadGuardians = async () => {
        try {
            const res = await getGuardians();
            setGuardians(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        // Validation
        if (!email || !password || !selectedGuardian) {
            setMessage('Please fill in all fields.');
            setMessageType('error');
            return;
        }

        if (password !== confirmPassword) {
            setMessage('Passwords do not match.');
            setMessageType('error');
            return;
        }

        if (password.length < 6) {
            setMessage('Password must be at least 6 characters.');
            setMessageType('error');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await parentRegister(email, password, selectedGuardian);
            setMessage('Registration successful! Redirecting to login...');
            setMessageType('success');
            setTimeout(() => navigate('/parent/login'), 1500);
        } catch (err) {
            setMessage(err.response?.data?.error || 'Registration failed. Try again.');
            setMessageType('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            minHeight: '100vh', background: '#f5f5f5'
        }}>
            <div style={{
                background: 'white', padding: '2rem', borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)', maxWidth: '450px', width: '100%'
            }}>
                <h2 style={{ color: '#1F6BB0', marginBottom: '0.5rem', textAlign: 'center' }}>
                    Create Parent Account
                </h2>
                <p style={{ color: '#666', textAlign: 'center', marginBottom: '2rem', fontSize: '14px' }}>
                    Register to manage your child's school fees
                </p>

                {message && (
                    <p style={{
                        background: messageType === 'success' ? '#e8f5e9' : '#ffebee',
                        color: messageType === 'success' ? '#2e7d32' : '#c62828',
                        padding: '10px', borderRadius: '6px', marginBottom: '1rem', fontSize: '14px'
                    }}>
                        {message}
                    </p>
                )}

                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                    {/* Guardian selection */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px' }}>
                            Select Your Profile
                        </label>
                        <p style={{ fontSize: '12px', color: '#666', margin: '0 0 8px' }}>
                            Choose your name and phone number to link to your child's account
                        </p>
                        <select
                            style={inputStyle}
                            value={selectedGuardian}
                            onChange={e => setSelectedGuardian(e.target.value)}
                            required
                        >
                            <option value="">-- Select your profile --</option>
                            {guardians.map(g => (
                                <option key={g.id} value={g.id}>
                                    {g.full_name} ({g.phone})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Email */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px' }}>
                            Email Address
                        </label>
                        <input
                            style={inputStyle}
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px' }}>
                            Password
                        </label>
                        <input
                            style={inputStyle}
                            type="password"
                            placeholder="At least 6 characters"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '13px' }}>
                            Confirm Password
                        </label>
                        <input
                            style={inputStyle}
                            type="password"
                            placeholder="Repeat password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Submit */}
                    <button
                        style={{
                            ...buttonStyle,
                            opacity: isSubmitting ? 0.6 : 1,
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            marginTop: '8px'
                        }}
                        type="submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Creating account...' : 'Register'}
                    </button>
                </form>

                {/* Link to login */}
                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '13px', color: '#666' }}>
                    Already have an account?{' '}
                    <Link to="/parent/login" style={{ color: '#1F6BB0', textDecoration: 'none', fontWeight: '500' }}>
                        Sign in here
                    </Link>
                </p>
            </div>
        </div>
    );
}

const inputStyle = {
    width: '100%', padding: '10px', borderRadius: '6px',
    border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box',
    fontFamily: 'Arial'
};

const buttonStyle = {
    padding: '12px', background: '#1F6BB0', color: 'white',
    border: 'none', borderRadius: '6px', cursor: 'pointer',
    fontSize: '14px', fontWeight: '500'
};

export default ParentRegister;