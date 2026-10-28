import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReplayHUD from '../components/ReplayHUD';
import ReplayControls from '../components/ReplayControls';
import { useReplayData } from '../hooks/useReplayData';
import '../styles/ReplayStyles.css';

export default function ReplayPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [currentTurn, setCurrentTurn] = useState(0);
    
    // SOLID: Delegate data fetching and parsing to a custom hook
    const { parsedLog, loading, error } = useReplayData(id);

    if (loading) {
        return (
            <div className="container mt-4 text-center text-white">
                <h2>Cargando Replay...</h2>
            </div>
        );
    }

    if (error || !parsedLog) {
        return (
            <div className="container mt-4 text-center">
                <div className="alert alert-danger" style={{ background: 'rgba(255, 51, 51, 0.2)', color: '#ffcccc', border: '1px solid rgba(255, 51, 51, 0.5)' }}>
                    {error || 'No se pudo cargar el replay.'}
                </div>
                <button className="btn btn-secondary mt-3" onClick={() => navigate('/match-history')}>
                    Volver al Historial
                </button>
            </div>
        );
    }

    const maxTurns = parsedLog.turns.length - 1;
    const turnData = parsedLog.turns[currentTurn];

    return (
        <div className="container mt-4 pb-5">
            <button className="btn btn-outline-light mb-4" onClick={() => navigate('/match-history')}>
                &larr; Volver al Historial
            </button>
            
            <div className="replay-container">
                <ReplayHUD 
                    p1Name={parsedLog.p1} 
                    p2Name={parsedLog.p2} 
                    turnData={turnData} 
                />
                
                <ReplayControls 
                    currentTurn={currentTurn} 
                    maxTurns={maxTurns} 
                    onTurnChange={(t) => setCurrentTurn(Math.max(0, Math.min(t, maxTurns)))} 
                />
            </div>
        </div>
    );
}
