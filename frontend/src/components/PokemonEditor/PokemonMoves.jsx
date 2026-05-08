import React from 'react';

export const PokemonMoves = ({
    currentPokemon,
    handleMoveClick,
    activeMoveSlot,
    moveSearchTerm,
    setMoveSearchTerm,
    availableMoves,
    selectMove
}) => {
    return (
        <div className="editor-moves-grid" style={{ position: 'relative' }}>
            {[0, 1, 2, 3].map((index) => (
                <div key={index} style={{ position: 'relative' }}>
                    <button 
                        type="button"
                        className="move-btn w-100" 
                        onClick={() => handleMoveClick(index)}
                        style={{ borderColor: activeMoveSlot === index ? 'white' : '' }}
                    >
                        {currentPokemon.moves[index] || `MOVE ${index + 1}`}
                    </button>

                    {activeMoveSlot === index && (
                        <div className="move-dropdown">
                            <input 
                                autoFocus
                                type="text" 
                                className="move-search-input" 
                                placeholder="Buscar ataque..." 
                                value={moveSearchTerm}
                                onChange={(e) => setMoveSearchTerm(e.target.value)}
                            />
                            
                            <div className="move-list-container">
                                {availableMoves.topMoves.filter(m => m.name.includes(moveSearchTerm.toUpperCase())).length > 0 && (
                                    <>
                                        <div className="move-category-title">⭐ MÁS USADOS</div>
                                        {availableMoves.topMoves
                                            .filter(m => m.name.includes(moveSearchTerm.toUpperCase()))
                                            .map(m => (
                                                <div key={m.name} className="move-item top-move" onClick={() => selectMove(m.name)}>
                                                    <span>{m.name}</span>
                                                    <span className="move-usage">{m.usage}</span>
                                                </div>
                                            ))
                                        }
                                    </>
                                )}

                                <div className="move-category-title">RESTO DE MOVIMIENTOS</div>
                                {availableMoves.otherMoves
                                    .filter(m => m.name.includes(moveSearchTerm.toUpperCase()))
                                    .map(m => (
                                        <div key={m.name} className="move-item" onClick={() => selectMove(m.name)}>
                                            {m.name}
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
