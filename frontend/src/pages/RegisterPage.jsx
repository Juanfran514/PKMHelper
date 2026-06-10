import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Modal, Button } from 'react-bootstrap';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [sdName, setSdName] = useState('');
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const result = await register(username, password, email, sdName);
        if (result.success) {
            setShowModal(true);
        } else {
            setError(result.error || 'Registration failed');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        navigate('/login');
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

                <button type="submit" className="auth-button">REGISTER</button>
                
                <div className="auth-center-link">
                    <Link to="/login" className="auth-link">← VOLVER AL LOGIN</Link>
                </div>
            </form>

            <Modal show={showModal} onHide={handleCloseModal} centered backdrop="static">
                <Modal.Header>
                    <Modal.Title>Verifica tu correo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Tu cuenta ha sido creada exitosamente. Hemos enviado un correo a <strong>{email}</strong> con un enlace para verificar tu cuenta.
                    </p>
                    <p>
                        Por favor, haz clic en el enlace para poder iniciar sesión.
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
