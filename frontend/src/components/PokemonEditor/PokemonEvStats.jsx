import React from 'react';
import { POKEMON_NATURES } from '../../constants/natures';
import { calculatePokemonStat, calculateEvsRemaining } from '../../utils/statCalculations';

export const PokemonEvStats = ({
    currentPokemon,
    setCurrentPokemon,
    handleEvChange,
    handleInputChange,
    baseStats,
    isNatureMenuOpen,
    setIsNatureMenuOpen,
    natureSearchTerm,
    setNatureSearchTerm,
    setIsItemMenuOpen,
    setActiveMoveSlot,
    handleDone
}) => {
    const evStatsMap = [
        { label: 'HP', key: 'hp' }, { label: 'ATK', key: 'atk' }, { label: 'DEF', key: 'def' },
        { label: 'SPATK', key: 'spa' }, { label: 'SPDEF', key: 'spd' }, { label: 'SPE', key: 'spe' }
    ];

    const evsRemaining = calculateEvsRemaining(currentPokemon.evs);

    return (
        <div className="editor-stats-container">
            <div className="stats-sliders">
                {evStatsMap.map(stat => (
                    <div className="stat-row" key={stat.key}>
                        <span className="stat-label">{stat.label}</span>
                        <input type="range" className="stat-range" min="0" max="32" value={currentPokemon.evs[stat.key]} onChange={(e) => handleEvChange(stat.key, e.target.value)} />
                        <input type="number" className="pill-input stat-number" min="0" max="32" value={currentPokemon.evs[stat.key]} onChange={(e) => handleEvChange(stat.key, e.target.value)} />
                        <span style={{ color: '#4facfe', width: '35px', textAlign: 'right', fontWeight: 'bold', fontSize: '14px' }}>
                            {calculatePokemonStat(stat.key, baseStats, currentPokemon)}
                        </span>
                    </div>
                ))}
            </div>
            <div className="stats-side-controls">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'stretch' }}>
                    <div className={`ev-counter ${evsRemaining === 0 ? 'empty' : ''}`} style={{ textAlign: 'center' }}>
                        PUNTOS: {evsRemaining}/66
                    </div>
                    <div style={{ position: 'relative' }}>
                        <input 
                            type="text" 
                            name="nature" 
                            className="pill-input nature-input" 
                            style={{ width: '100%' }}
                            placeholder="NATURE" 
                            value={isNatureMenuOpen ? natureSearchTerm : currentPokemon.nature} 
                            onChange={(e) => {
                                if (isNatureMenuOpen) {
                                    setNatureSearchTerm(e.target.value);
                                } else {
                                    handleInputChange(e);
                                }
                            }}
                            onClick={() => {
                                setIsNatureMenuOpen(true);
                                setNatureSearchTerm("");
                                setIsItemMenuOpen(false);
                                setActiveMoveSlot(null);
                            }}
                            autoComplete="off" 
                        />
                        {isNatureMenuOpen && (
                            <div className="move-dropdown" style={{ zIndex: 100, bottom: '100%', top: 'auto', marginBottom: '5px' }}>
                                <div className="move-list-container">
                                    {POKEMON_NATURES
                                        .filter(n => n.name.toUpperCase().includes(natureSearchTerm.toUpperCase()))
                                        .map(nature => (
                                            <div 
                                                key={nature.name} 
                                                className="move-item" 
                                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px' }}
                                                onClick={() => {
                                                    setCurrentPokemon(prev => ({ ...prev, nature: nature.name }));
                                                    setIsNatureMenuOpen(false);
                                                }}
                                            >
                                                <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>{nature.name}</span>
                                                {nature.plus && nature.minus && (
                                                    <span style={{ fontSize: '0.65rem', opacity: 0.9 }}>
                                                        <span style={{ color: '#4CAF50', marginRight: '4px' }}>+{nature.plus}</span>
                                                        <span style={{ color: '#ff6b6b' }}>-{nature.minus}</span>
                                                    </span>
                                                )}
                                                {!nature.plus && (
                                                    <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>Neutral</span>
                                                )}
                                            </div>
                                        ))
                                    }
                                    <div 
                                        className="move-item" 
                                        style={{ textAlign: 'center', color: '#ff6b6b', marginTop: '10px' }}
                                        onClick={() => setIsNatureMenuOpen(false)}
                                    >
                                        ✖ Cerrar
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <button type="button" className="done-btn" onClick={handleDone}>DONE</button>
            </div>
        </div>
    );
};
