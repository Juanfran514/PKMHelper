import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Modal, Button } from 'react-bootstrap';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [showModal, setShowModal] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');

    useEffect(() => {
        if (location.state?.registeredEmail) {
            setRegisteredEmail(location.state.registeredEmail);
            setShowModal(true);
            // Clear state so modal doesn't show again on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location]);

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
                    <Link to="/forgot-password" className="auth-link">FORGOT PASSWORD</Link>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <button type="submit" className="auth-button">LOGIN</button>
                
                <div className="auth-center-link">
                    <Link to="/register" className="auth-link">REGISTER</Link>
                </div>
            </form>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Verifica tu correo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Tu cuenta ha sido creada exitosamente. Hemos enviado un correo a <strong>{registeredEmail}</strong> con un enlace para verificar tu cuenta.
                    </p>
                    <p>
                        Por favor, haz clic en el enlace de tu correo para poder iniciar sesión.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => setShowModal(false)}>
                        Entendido
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
