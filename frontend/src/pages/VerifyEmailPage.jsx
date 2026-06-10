import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No verification token provided.');
            return;
        }

        const verifyEmail = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://pkmhelper-production.up.railway.app/api'}/auth/verify-email?token=${token}`);
                const data = await response.json();

                if (response.ok) {
                    setStatus('success');
                    setMessage(data.message || 'Email verified successfully!');
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Failed to verify email.');
                }
            } catch (err) {
                setStatus('error');
                setMessage('An error occurred during verification.');
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <div className="auth-card" style={{ textAlign: 'center' }}>
            <h2 className="auth-title">EMAIL VERIFICATION</h2>
            
            <div style={{ margin: '2rem 0' }}>
                {status === 'verifying' && <p style={{ color: '#aaa' }}>{message}</p>}
                {status === 'success' && <p style={{ color: '#4caf50', fontSize: '1.2rem' }}>{message}</p>}
                {status === 'error' && <p style={{ color: '#f44336', fontSize: '1.2rem' }}>{message}</p>}
            </div>

            <div className="auth-center-link" style={{ marginTop: '2rem' }}>
                <Link to="/login" className="auth-button" style={{ textDecoration: 'none', display: 'inline-block', padding: '10px 20px' }}>
                    GO TO LOGIN
                </Link>
            </div>
        </div>
    );
}
