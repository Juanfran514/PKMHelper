import React, { useState, useEffect } from 'react';
import { Modal, Button, ProgressBar } from 'react-bootstrap';
import { teamService } from '../services/teamService';
import '../styles/TeamAnalyticsModal.css';

export default function TeamAnalyticsModal({ show, onHide, teamId }) {
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (show && teamId) {
            setLoading(true);
            teamService.getTeamAnalytics(teamId)
                .then(data => {
                    setAnalytics(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Error cargando analíticas:", err);
                    setLoading(false);
                });
        }
    }, [show, teamId]);

    const getWinRateColor = (winRate) => {
        if (winRate >= 60) return '#10b981'; // Verde esmeralda
        if (winRate >= 50) return '#f59e0b'; // Naranja
        return '#ef4444'; // Rojo
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            centered
            contentClassName="analytics-modal-content"
        >
            <Modal.Header closeButton className="analytics-modal-header">
                <Modal.Title>Analíticas de Rendimiento</Modal.Title>
            </Modal.Header>
            <Modal.Body className="analytics-modal-body">
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-light" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                    </div>
                ) : analytics.length === 0 ? (
                    <div className="text-center py-5">
                        <h4>Aún no hay datos</h4>
                        <p>Juega combates con este equipo para generar estadísticas.</p>
                    </div>
                ) : (
                    <div className="analytics-grid">
                        {analytics.map((pkmn, idx) => {
                            const color = getWinRateColor(pkmn.winRate);
                            // Sprite fallback to showdown standard (could be improved if we had local sprites here)
                            const spriteUrl = `https://play.pokemonshowdown.com/sprites/gen5/${pkmn.pokemonName.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`;

                            return (
                                <div key={idx} className="analytics-card">
                                    <div className="pokemon-info">
                                        <img src={spriteUrl} alt={pkmn.pokemonName} className="pokemon-sprite" />
                                        <h5>{pkmn.pokemonName}</h5>
                                    </div>

                                    <div className="stats-info">
                                        <div className="stats-row">
                                            <span>Win Rate</span>
                                            <span style={{ color, fontWeight: 'bold' }}>{pkmn.winRate}%</span>
                                        </div>
                                        <div className="progress-container">
                                            <div
                                                className="progress-bar-animated"
                                                style={{ width: `${pkmn.winRate}%`, backgroundColor: color }}
                                            />
                                        </div>
                                        <div className="stats-row details">
                                            <span>{pkmn.wins} V</span>
                                            <span>{pkmn.losses} D</span>
                                            <span>({pkmn.matches} Totales)</span>
                                        </div>

                                        {pkmn.moves && pkmn.moves.length > 0 && (
                                            <div className="moves-stats-container mt-3" style={{ fontSize: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
                                                <div style={{ color: '#aaa', marginBottom: '5px', fontWeight: 'bold' }}>Movimientos (Top 4):</div>
                                                {pkmn.moves.slice(0, 4).map((m, i) => (
                                                    <div key={i} className="d-flex justify-content-between mb-1 align-items-center">
                                                        <span style={{ color: '#eee', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70%' }}>
                                                            {m.moveName}
                                                        </span>
                                                        <span style={{ color: '#888', whiteSpace: 'nowrap' }}>
                                                            {m.timesUsed} {m.timesUsed === 1 ? 'uso' : 'usos'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
}
