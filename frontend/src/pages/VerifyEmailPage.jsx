import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [message, setMessage] = useState('Verificando tu cuenta...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('El enlace de verificación no es válido o falta el token.');
            return;
        }

        const verifyToken = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://pkmhelper-production.up.railway.app/api'}/auth/verify-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                });

                const data = await response.json();

                if (response.ok) {
                    setStatus('success');
                    setMessage('¡Tu cuenta ha sido verificada con éxito! Ya puedes iniciar sesión.');
                } else {
                    setStatus('error');
                    setMessage(data.error || 'No se pudo verificar la cuenta. El enlace puede haber expirado.');
                }
            } catch (error) {
                setStatus('error');
                setMessage('Hubo un problema de conexión al intentar verificar la cuenta.');
            }
        };

        verifyToken();
    }, [token]);

    return (
        <div className="auth-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <h2 className="auth-title">VERIFICACIÓN</h2>
            
            <div style={{ margin: '30px 0', fontSize: '1.2rem', color: status === 'error' ? '#f44336' : status === 'success' ? '#4caf50' : 'white' }}>
                {message}
            </div>

            {status !== 'verifying' && (
                <div style={{ marginTop: '20px' }}>
                    <Link to="/login" className="auth-button" style={{ display: 'inline-block', textDecoration: 'none' }}>
                        IR AL LOGIN
                    </Link>
                </div>
            )}
        </div>
    );
}
