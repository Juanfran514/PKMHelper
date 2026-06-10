import React from 'react';

export default function ReplayControls({ currentTurn, maxTurns, onTurnChange }) {
    return (
        <div className="replay-controls">
            <button 
                className="replay-btn" 
                onClick={() => onTurnChange(0)} 
                disabled={currentTurn === 0}
            >
                &lt;&lt; Inicio
            </button>
            
            <button 
                className="replay-btn" 
                onClick={() => onTurnChange(currentTurn - 1)} 
                disabled={currentTurn === 0}
            >
                &lt; Anterior
            </button>
            
            <button 
                className="replay-btn" 
                onClick={() => onTurnChange(currentTurn + 1)} 
                disabled={currentTurn === maxTurns}
            >
                Siguiente &gt;
            </button>
            
            <button 
                className="replay-btn" 
                onClick={() => onTurnChange(maxTurns)} 
                disabled={currentTurn === maxTurns}
            >
                Final &gt;&gt;
            </button>
        </div>
    );
}
