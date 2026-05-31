import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const result = await login(username, password);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error || 'Login failed');
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

                <button type="submit" className="auth-button">LOGIN</button>
                
                <div className="auth-center-link">
                    <Link to="/register" className="auth-link">REGISTER</Link>
                </div>
            </form>
        </div>
    );
}
