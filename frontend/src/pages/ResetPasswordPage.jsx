import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('No reset token provided. Please use the link sent to your email.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setLoading(true);
        
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'https://pkmhelper-production.up.railway.app/api';
            const endpoint = apiUrl.endsWith('/api') ? '/auth/reset-password' : '/api/auth/reset-password';
            
            await axios.post(`${apiUrl}${endpoint}`, { 
                token, 
                newPassword: password 
            });
            setShowModal(true);
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Failed to reset password. The link might be expired or invalid.');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        navigate('/login');
    };

    return (
        <div className="auth-card">
            <h2 className="auth-title">NUEVA CONTRASEÑA</h2>
            <form className="auth-form" onSubmit={handleSubmit}>
                <p className="text-muted text-center mb-4" style={{ color: '#aaa', fontSize: '0.9rem' }}>
                    Introduce tu nueva contraseña.
                </p>

                <div className="auth-form-group">
                    <label className="auth-label">NEW PASSWORD</label>
                    <input 
                        type="password" 
                        className="auth-input" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading || !token}
                    />
                </div>

                <div className="auth-form-group">
                    <label className="auth-label">CONFIRM PASSWORD</label>
                    <input 
                        type="password" 
                        className="auth-input" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading || !token}
                    />
                </div>

                {error && <div className="auth-error">{error}</div>}

                <button type="submit" className="auth-button" disabled={loading || !token}>
                    {loading ? 'UPDATING...' : 'UPDATE PASSWORD'}
                </button>
                
                <div className="auth-center-link">
                    <Link to="/login" className="auth-link">← VOLVER AL LOGIN</Link>
                </div>
            </form>

            <Modal show={showModal} onHide={handleCloseModal} centered backdrop="static">
                <Modal.Header>
                    <Modal.Title>Contraseña Actualizada</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Tu contraseña se ha actualizado correctamente.
                    </p>
                    <p>
                        Ya puedes iniciar sesión con tu nueva contraseña.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleCloseModal}>
                        Ir al Login
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
