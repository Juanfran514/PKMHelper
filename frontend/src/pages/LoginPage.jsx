import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [unverified, setUnverified] = useState(false);
    const [resendMsg, setResendMsg] = useState('');
    const [isResending, setIsResending] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setUnverified(false);
        setResendMsg('');
        
        const result = await login(username, password);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error || 'Login failed');
            if (result.unverified) {
                setUnverified(true);
            }
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        setResendMsg('');
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://pkmhelper-production.up.railway.app/api'}/auth/resend-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            const data = await response.json();
            if (response.ok) {
                setResendMsg('Correo reenviado exitosamente. Por favor, revisa tu bandeja de entrada.');
            } else {
                setResendMsg(data.error || 'Error al reenviar el correo.');
            }
        } catch (err) {
            setResendMsg('Error de conexión al intentar reenviar el correo.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="auth-card">
            <h2 className="auth-title">LOGIN</h2>
            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="auth-form-group">
                    <label className="auth-label">USERNAME</label>
                    <input 
                        type="text" 
                        className="auth-input" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                
                <div className="auth-form-group">
                    <label className="auth-label">PASSWORD</label>
                    <input 
                        type="password" 
                        className="auth-input" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="auth-links">
                    <span className="auth-link">FORGOT PASSWORD</span>
                </div>

                {error && <div className="auth-error">{error}</div>}
                {unverified && (
                    <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                        <button 
                            type="button" 
                            onClick={handleResend} 
                            disabled={isResending}
                            style={{ background: 'none', border: 'none', color: '#ffeb3b', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            {isResending ? 'Enviando...' : 'Reenviar correo de verificación'}
                        </button>
                    </div>
                )}
                {resendMsg && <div className="auth-success" style={{ color: '#4caf50', marginBottom: '15px', textAlign: 'center' }}>{resendMsg}</div>}

                <button type="submit" className="auth-button">LOGIN</button>
                
                <div className="auth-center-link">
                    <Link to="/register" className="auth-link">REGISTER</Link>
                </div>
            </form>
        </div>
    );
}
