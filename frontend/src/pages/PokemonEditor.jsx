import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTeamContext } from '../context/TeamContext';
import { usePokeAPI } from '../hooks/usePokeAPI';
import '../styles/PokemonEditor.css';

export default function PokemonEditor() {
    const navigate = useNavigate();
    const { slotIndex } = useParams();
    const activeIndex = Number(slotIndex) || 0;
    
    const { teamData, updatePokemon } = useTeamContext();

    const [currentPokemon, setCurrentPokemon] = useState({
        name: '', item: '', teraType: '', ability: '', nature: '',
        moves: ['', '', '', ''],
        evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
    });

    const [activeTab, setActiveTab] = useState(activeIndex);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [activeMoveSlot, setActiveMoveSlot] = useState(null);
    const [moveSearchTerm, setMoveSearchTerm] = useState("");
    const [availableMoves, setAvailableMoves] = useState({ topMoves: [], otherMoves: [] });
    const [pokemonStats, setPokemonStats] = useState(null); 

    const { 
        pokemonSprite, setPokemonSprite, loadSprite, 
        fetchPokemonDetails, getFilteredList, getSortedMoves 
    } = usePokeAPI();

    // 1. Cargar el estado al cambiar de pestaña
    useEffect(() => {
        const savedPokemon = teamData.pokemon[activeTab];
        if (savedPokemon) {
            setCurrentPokemon(savedPokemon);
            loadSprite(savedPokemon.name);
        } else {
            setCurrentPokemon({
                name: '', item: '', teraType: '', ability: '', nature: '',
                moves: ['', '', '', ''],
                evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }
            });
            setPokemonSprite(null);
        }
        setIsSearchOpen(false);
        setActiveMoveSlot(null);
    }, [activeTab, teamData.pokemon]);

    // NUEVO: 2. Traer datos del backend cuando el Pokémon cambia
    useEffect(() => {
        if (currentPokemon.name) {
            // ¡IMPORTANTE! Cambia esta URL por la de tu backend real
            const backendUrl = `http://localhost:5000/api/stats/${currentPokemon.name}`; 
            
            fetch(backendUrl)
                .then(res => res.json())
                .then(data => setPokemonStats(data))
                .catch(err => {
                    console.log("No hay datos scrapeados en backend para:", currentPokemon.name);
                    setPokemonStats(null);
                });
        } else {
            setPokemonStats(null);
        }
    }, [currentPokemon.name]);

    // 3. Buscador de Nombre de Pokémon
    const handleNameChange = (e) => {
        const value = e.target.value.toUpperCase();
        setCurrentPokemon(prev => ({ ...prev, name: value }));
        setIsSearchOpen(value.length > 0);
    };

    const handleSelectPokemon = async (pokeName) => {
        const details = await fetchPokemonDetails(pokeName);
        if (details) {
            setCurrentPokemon(prev => ({
                ...prev,
                name: details.name,
                ability: details.ability,
                teraType: details.teraType,
                moves: ['', '', '', ''] // Limpiamos movimientos al cambiar pokemon
            }));
        }
        setIsSearchOpen(false); 
    };

    // 4. Manejadores de Inputs Generales
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentPokemon(prev => ({ ...prev, [name]: value }));
    };

    const handleDone = () => {
        updatePokemon(activeTab, currentPokemon);
        navigate('/teambuilder');
    };

    // 5. Lógica de EVs (Límite 32)
    const evStatsMap = [
        { label: 'HP', key: 'hp' }, { label: 'ATK', key: 'atk' }, { label: 'DEF', key: 'def' },
        { label: 'SPATK', key: 'spa' }, { label: 'SPDEF', key: 'spd' }, { label: 'SPE', key: 'spe' }
    ];

    const handleEvChange = (key, value) => {
        let numValue = parseInt(value, 10) || 0;
        if (numValue > 32) numValue = 32; 
        if (numValue < 0) numValue = 0;
        setCurrentPokemon(prev => ({ ...prev, evs: { ...prev.evs, [key]: numValue } }));
    };

    // 6. Lógica de los Movimientos
    const handleMoveClick = async (slotIndex) => {
        if (activeMoveSlot === slotIndex) {
            setActiveMoveSlot(null);
            return;
        }
        setActiveMoveSlot(slotIndex);
        setMoveSearchTerm("");

        const sortedMoves = await getSortedMoves(currentPokemon.name, pokemonStats);
        setAvailableMoves(sortedMoves);
    };

    const selectMove = (moveName) => {
        const newMoves = [...currentPokemon.moves];
        newMoves[activeMoveSlot] = moveName;
        setCurrentPokemon(prev => ({ ...prev, moves: newMoves }));
        setActiveMoveSlot(null); 
    };

    const filteredPokemon = getFilteredList(currentPokemon.name);

    return (
        <div className="container-fluid px-4 py-3 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <div className="editor-panel">
                
                <div className="editor-tabs">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                        <div key={index} className={`editor-tab ${activeTab === index ? 'active' : ''}`} onClick={() => setActiveTab(index)}>
                            <div className="tab-circle"></div>
                        </div>
                    ))}
                </div>

                <div className="editor-body">
                    
                    <div className="editor-left">
                        <div className="pokemon-search-container">
                            <input 
                                type="text" 
                                name="name" 
                                className="pill-input full-width" 
                                style={{ marginBottom: 0 }}
                                placeholder="POKEMON NAME" 
                                value={currentPokemon.name} 
                                onChange={handleNameChange}
                                onFocus={() => currentPokemon.name && setIsSearchOpen(true)}
                                autoComplete="off"
                            />
                            
                            {isSearchOpen && filteredPokemon.length > 0 && (
                                <div className="autocomplete-dropdown">
                                    {filteredPokemon.map(p => (
                                        <div key={p.name} className="autocomplete-item" onClick={() => handleSelectPokemon(p.name)}>
                                            {p.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="editor-image-box" style={{ marginTop: '20px', cursor: 'default' }}>
                            {pokemonSprite && (
                                <img src={pokemonSprite} alt={currentPokemon.name} className="poke-sprite" />
                            )}
                        </div>
                    </div>

                    <div className="editor-right">
                        <div className="editor-top-inputs">
                            <input type="text" name="item" className="pill-input" placeholder="ITEM" value={currentPokemon.item} onChange={handleInputChange} autoComplete="off" />
                            <input type="text" name="teraType" className="pill-input" placeholder="TERA TYPE" value={currentPokemon.teraType} onChange={handleInputChange} autoComplete="off" />
                            <input type="text" name="ability" className="pill-input" placeholder="ABILITY" value={currentPokemon.ability} onChange={handleInputChange} autoComplete="off" />
                        </div>

                        <div className="editor-moves-grid" style={{ position: 'relative' }}>
                            {[0, 1, 2, 3].map((index) => (
                                <div key={index} style={{ position: 'relative' }}>
                                    <button 
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

                        <div className="editor-stats-container">
                            <div className="stats-sliders">
                                {evStatsMap.map(stat => (
                                    <div className="stat-row" key={stat.key}>
                                        <span className="stat-label">{stat.label}</span>
                                        <input type="range" className="stat-range" min="0" max="32" value={currentPokemon.evs[stat.key]} onChange={(e) => handleEvChange(stat.key, e.target.value)} />
                                        <input type="number" className="pill-input stat-number" min="0" max="32" value={currentPokemon.evs[stat.key]} onChange={(e) => handleEvChange(stat.key, e.target.value)} />
                                    </div>
                                ))}
                            </div>
                            <div className="stats-side-controls">
                                <input type="text" name="nature" className="pill-input nature-input" placeholder="NATURE" value={currentPokemon.nature} onChange={handleInputChange} autoComplete="off" />
                                <button className="done-btn" onClick={handleDone}>DONE</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}