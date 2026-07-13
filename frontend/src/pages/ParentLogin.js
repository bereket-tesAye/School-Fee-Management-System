import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parentLogin } from '../api/api';

function ParentLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('error');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await parentLogin(email, password);
            // Store token and parent info in localStorage
            localStorage.setItem('parentToken', res.data.access);
            localStorage.setItem('parentId', res.data.parent_id);
            localStorage.setItem('parentName', res.data.name);
            localStorage.setItem('guardianId', res.data.guardian_id);

            setMessage('Login successful! Redirecting...');
            setMessageType('success');
            setTimeout(() => navigate('/parent/dashboard'), 1000);
        } catch (err) {
            setMessage(err.response?.data?.error || 'Login failed. Please try again.');
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            minHeight: '100vh', background: '#f5f5f5'
        }}>
            <div style={{
                background: 'white', padding: '2rem', borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)', maxWidth: '400px', width: '100%'
            }}>
                <h2 style={{ color: '#1F6BB0', marginBottom: '1.5rem', textAlign: 'center' }}>
                    Parent Login
                </h2>
                <p style={{ color: '#666', textAlign: 'center', marginBottom: '2rem', fontSize: '14px' }}>
                    Sign in to view your child's fees and submit payments
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

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input
                        style={inputStyle}
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <input
                        style={inputStyle}
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <button
                        style={{ ...buttonStyle, opacity: isLoading ? 0.6 : 1 }}
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '13px', color: '#666' }}>
                    Don't have an account? Contact your school to register.
                </p>
            </div>
        </div>
    );
}

const inputStyle = {
    padding: '12px', borderRadius: '6px', border: '1px solid #ccc',
    fontSize: '14px', fontFamily: 'Arial'
};

const buttonStyle = {
    padding: '12px', background: '#1F6BB0', color: 'white',
    border: 'none', borderRadius: '6px', cursor: 'pointer',
    fontSize: '14px', fontWeight: '500'
};

export default ParentLogin;