import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/AuthStyles.css';

export default function MatchHistoryPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMatches = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/users/matches`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    setMatches(data);
                } else {
                    setError(data.error || 'Error al cargar el historial');
                }
            } catch (err) {
                setError('No se pudo conectar con el servidor.');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchMatches();
        } else {
            setLoading(false);
            setError('Inicia sesión para ver tu historial de partidas.');
        }
    }, [user]);

    return (
        <div className="container mt-4 pb-5">
            <h2 className="mb-4 text-white font-weight-bold" style={{ borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                MATCH HISTORY
            </h2>

            {loading && <p style={{ color: 'white' }}>Cargando partidas...</p>}
            {error && <div className="alert alert-danger" style={{ background: 'rgba(255, 51, 51, 0.2)', color: '#ffcccc', border: '1px solid rgba(255, 51, 51, 0.5)' }}>{error}</div>}

            {!loading && !error && matches.length === 0 && (
                <div style={{ background: 'rgba(20, 20, 30, 0.7)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', textAlign: 'center' }}>
                    <h4>No se encontraron partidas</h4>
                </div>
            )}

            {!loading && !error && matches.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {matches.map(match => {
                        const isWin = match.result === 'WIN';
                        const isTie = match.result === 'TIE';

                        let bgColor, borderColor, resultText, resultColor;
                        if (isWin) {
                            bgColor = 'rgba(0, 204, 102, 0.1)';
                            borderColor = 'rgba(0, 204, 102, 0.4)';
                            resultText = 'VICTORY';
                            resultColor = '#00cc66';
                        } else if (isTie) {
                            bgColor = 'rgba(200, 200, 200, 0.1)';
                            borderColor = 'rgba(200, 200, 200, 0.4)';
                            resultText = 'TIE';
                            resultColor = '#cccccc';
                        } else {
                            bgColor = 'rgba(255, 51, 51, 0.1)';
                            borderColor = 'rgba(255, 51, 51, 0.4)';
                            resultText = 'DEFEAT';
                            resultColor = '#ff3333';
                        }

                        return (
                            <div key={match.id} style={{
                                background: bgColor,
                                border: `1px solid ${borderColor}`,
                                backdropFilter: 'blur(10px)',
                                borderRadius: '12px',
                                padding: '1.5rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                color: 'white',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                cursor: 'default'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = `0 4px 15px ${bgColor}`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}>
                                <div>
                                    <h4 style={{ margin: 0, fontWeight: 'bold' }}>vs {match.opponent_name || 'Unknown'}</h4>
                                    <div style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '0.4rem' }}>
                                        {new Date(match.played_at).toLocaleString()}
                                    </div>
                                    {match.team_name && (
                                        <div style={{ fontSize: '0.9rem', color: '#f0e68c', marginTop: '0.2rem', fontWeight: '500' }}>
                                            Team: {match.team_name}
                                        </div>
                                    )}
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    <div style={{
                                        fontSize: '1.4rem',
                                        fontWeight: '800',
                                        color: resultColor,
                                        letterSpacing: '1px',
                                        marginBottom: '0.5rem'
                                    }}>
                                        {resultText}
                                    </div>
                                    <button
                                        className="btn btn-sm"
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            color: 'white',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            borderRadius: '6px',
                                            fontWeight: '500'
                                        }}
                                        onClick={() => navigate(`/replay/${match.id}`)}
                                        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                                        onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                                    >
                                        Watch Replay
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
