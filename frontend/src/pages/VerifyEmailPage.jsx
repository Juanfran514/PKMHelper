import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Button, Spinner, Alert } from 'react-bootstrap';

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No verification token provided.');
            return;
        }

        const verifyEmail = async () => {
            try {
                // Ensure to point to the correct backend API URL if not proxied
                // Assuming VITE_API_URL or relative path is used across the app
                const apiUrl = import.meta.env.VITE_API_URL || '';
                
                const response = await axios.get(`${apiUrl}/api/auth/verify?token=${token}`);
                
                if (response.status === 200) {
                    setStatus('success');
                    setMessage(response.data.message || 'Email verified successfully! You can now login.');
                }
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.error || err.response?.data?.message || 'Verification failed. The link might be expired or invalid.');
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <Card style={{ width: '100%', maxWidth: '400px' }} className="shadow-sm">
                <Card.Body className="text-center">
                    <h2 className="mb-4">Email Verification</h2>
                    
                    {status === 'loading' && (
                        <div>
                            <Spinner animation="border" variant="primary" className="mb-3" />
                            <p className="text-muted">{message}</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div>
                            <Alert variant="success">{message}</Alert>
                            <Button 
                                variant="primary" 
                                className="w-100 mt-3"
                                onClick={() => navigate('/login')}
                            >
                                Go to Login
                            </Button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div>
                            <Alert variant="danger">{message}</Alert>
                            <Button 
                                variant="outline-secondary" 
                                className="w-100 mt-3"
                                onClick={() => navigate('/login')}
                            >
                                Return to Login
                            </Button>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default VerifyEmailPage;
