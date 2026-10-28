import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'https://pkmhelper-production.up.railway.app/api';
            const endpoint = apiUrl.endsWith('/api') ? '/auth/forgot-password' : '/api/auth/forgot-password';
            
            await axios.post(`${apiUrl}${endpoint}`, { email });
            setShowModal(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to request password reset. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-card">
            <h2 className="auth-title">FORGOT PASSWORD</h2>
            <form className="auth-form" onSubmit={handleSubmit}>
                <p className="text-center mb-4" style={{ color: '#f8f9fa', fontSize: '0.95rem' }}>
                    Introduce tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                </p>

                <div className="auth-form-group">
                    <label className="auth-label">EMAIL</label>
                    <input 
                        type="email" 
                        className="auth-input" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                {error && <div className="auth-error">{error}</div>}

                <button type="submit" className="auth-button" disabled={loading}>
                    {loading ? 'SENDING...' : 'SEND RESET LINK'}
                </button>
                
                <div className="auth-center-link">
                    <Link to="/login" className="auth-link">← VOLVER AL LOGIN</Link>
                </div>
            </form>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered backdrop="static">
                <Modal.Header>
                    <Modal.Title>Correo enviado</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Si existe una cuenta asociada a <strong>{email}</strong>, hemos enviado un enlace para restablecer la contraseña.
                    </p>
                    <p>
                        Por favor, revisa tu bandeja de entrada y la carpeta de spam.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Link to="/login">
                        <Button variant="primary">
                            Ir al Login
                        </Button>
                    </Link>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
