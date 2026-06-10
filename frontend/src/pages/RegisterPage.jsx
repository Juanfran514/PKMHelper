import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [sdName, setSdName] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        
        const result = await register(username, password, email, sdName);
        if (result.success) {
            setSuccessMsg('Registro completado. Por favor, revisa tu correo electrónico para verificar tu cuenta antes de iniciar sesión.');
            // Clear form
            setUsername('');
            setPassword('');
            setEmail('');
            setSdName('');
        } else {
            setError(result.error || 'Registration failed');
        }
    };

    return (
        <div className="auth-card">
            <h2 className="auth-title">REGISTER</h2>
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

                <div className="auth-form-group">
                    <label className="auth-label">EMAIL</label>
                    <input 
                        type="email" 
                        className="auth-input" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="auth-form-group">
                    <label className="auth-label">SHOWDOWN NAME</label>
                    <input 
                        type="text" 
                        className="auth-input" 
                        value={sdName}
                        onChange={(e) => setSdName(e.target.value)}
                    />
                </div>

                {error && <div className="auth-error">{error}</div>}
                {successMsg && <div className="auth-success" style={{ color: '#4caf50', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold' }}>{successMsg}</div>}

                <button type="submit" className="auth-button">REGISTER</button>
                
                <div className="auth-center-link">
                    <Link to="/login" className="auth-link">← VOLVER AL LOGIN</Link>
                </div>
            </form>
        </div>
    );
}
