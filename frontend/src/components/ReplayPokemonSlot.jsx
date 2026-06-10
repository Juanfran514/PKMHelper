import React, { useState, useEffect } from 'react';
import { fetchPokemonSprite } from '../services/api';

export default function ReplayPokemonSlot({ name, hp }) {
    const [spriteUrl, setSpriteUrl] = useState(null);

    const safeHp = hp || { current: 0, max: 100, status: '', fainted: false };
    const hpPercent = (safeHp.current / safeHp.max) * 100;
    
    let hpColor = '#00cc66'; // Green
    if (hpPercent < 20) hpColor = '#ff3333'; // Red
    else if (hpPercent < 50) hpColor = '#ffaa00'; // Yellow

    useEffect(() => {
        let isMounted = true;
        
        const loadSprite = async () => {
            if (name && name !== 'Unknown' && name !== 'Vacío') {
                const url = await fetchPokemonSprite(name);
                if (isMounted && url) {
                    setSpriteUrl(url);
                }
            }
        };

        loadSprite();

        return () => {
            isMounted = false;
        };
    }, [name]);

    if (!name || name === 'Vacío') {
        return (
            <div className="active-pokemon" style={{ opacity: 0.3 }}>
                <div className="pokemon-sprite" style={{ background: '#222', borderRadius: '50%' }}></div>
                <div className="pokemon-info">
                    <div className="pokemon-name">Vacío</div>
                </div>
            </div>
        );
    }

    return (
        <div className="active-pokemon">
            {spriteUrl ? (
                <img 
                    src={spriteUrl} 
                    alt={name} 
                    className="pokemon-sprite" 
                    style={{ 
                        opacity: safeHp.fainted ? 0.3 : 1, 
                        filter: safeHp.fainted ? 'grayscale(100%)' : 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' 
                    }} 
                />
            ) : (
                <div className="pokemon-sprite" style={{ background: '#333', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>?</div>
            )}
            
            <div className="pokemon-info">
                <div className="pokemon-name">
                    {name} 
                    {safeHp.status && (
                        <span style={{fontSize: '0.8rem', background: '#555', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px'}}>
                            {safeHp.status.toUpperCase()}
                        </span>
                    )}
                </div>
                <div className="hp-bar-container">
                    <div className="hp-bar" style={{ width: `${Math.max(0, hpPercent)}%`, backgroundColor: hpColor }}></div>
                </div>
                {safeHp.fainted ? (
                    <div className="fainted-text">DEBILITADO</div>
                ) : (
                    <div className="hp-text">{Math.round(hpPercent)}% ({safeHp.current}/{safeHp.max})</div>
                )}
            </div>
        </div>
    );
}
