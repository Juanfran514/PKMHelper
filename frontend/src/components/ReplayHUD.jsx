import React from 'react';
import ReplayPokemonSlot from './ReplayPokemonSlot';
import '../styles/ReplayStyles.css';

export default function ReplayHUD({ p1Name, p2Name, turnData }) {
    if (!turnData || !turnData.stateSnapshot) return <div className="replay-hud">Loading HUD...</div>;

    const { p1, p2 } = turnData.stateSnapshot;

    // Helper to extract clean props for the slot
    const getSlotData = (activePkmn, teamData) => {
        const pkmnState = teamData && activePkmn ? teamData[activePkmn.name] : null;
        const name = pkmnState ? pkmnState.name : (activePkmn ? activePkmn.name : 'Vacío');
        const hp = pkmnState ? pkmnState.hp : { current: 0, max: 100, status: '', fainted: false };
        return { name, hp };
    };

    const p1Actives = [
        getSlotData(p1.active.find(a => a.slot === 'p1a'), p1.team),
        getSlotData(p1.active.find(a => a.slot === 'p1b'), p1.team)
    ];
    
    const p2Actives = [
        getSlotData(p2.active.find(a => a.slot === 'p2a'), p2.team),
        getSlotData(p2.active.find(a => a.slot === 'p2b'), p2.team)
    ];

    return (
        <div className="replay-hud-container">
            <div className="replay-header">
                <div className="replay-player-name">{p1Name}</div>
                <div className="replay-turn-indicator">Turno {turnData.turnNumber}</div>
                <div className="replay-player-name">{p2Name}</div>
            </div>

            <div className="replay-hud">
                <div className="player-side p1-side">
                    {p1Actives.map((data, idx) => (
                        <ReplayPokemonSlot key={`p1-${idx}`} name={data.name} hp={data.hp} />
                    ))}
                </div>

                <div className="player-side p2-side">
                    {p2Actives.map((data, idx) => (
                        <ReplayPokemonSlot key={`p2-${idx}`} name={data.name} hp={data.hp} />
                    ))}
                </div>
            </div>

            <div className="replay-log-box">
                {turnData.events.length === 0 ? (
                    <div style={{ opacity: 0.5, textAlign: 'center', marginTop: '2rem' }}>No hay eventos registrados en este turno.</div>
                ) : (
                    turnData.events.map((ev, i) => (
                        <div key={i} className="log-event">{ev}</div>
                    ))
                )}
            </div>
        </div>
    );
}
