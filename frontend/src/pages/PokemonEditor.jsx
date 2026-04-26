import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTeamContext } from '../context/TeamContext';
import { usePokeAPI } from '../hooks/usePokeAPI'; // ¡Importamos nuestro nuevo hook!
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

    // Extraemos toda la magia de la PokeAPI desde el hook
    const { 
        pokemonSprite, 
        setPokemonSprite, 
        loadSprite, 
        fetchPokemonDetails, 
        getFilteredList 
    } = usePokeAPI();

    // Cargar el estado y la imagen al cambiar de pestaña
    useEffect(() => {
        const savedPokemon = teamData.pokemon[activeTab];
        if (savedPokemon) {
            setCurrentPokemon(savedPokemon);
            // Usamos la función del hook para cargar la imagen
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
    }, [activeTab, teamData.pokemon]);

    // Función para escribir el nombre y abrir el desplegable
    const handleNameChange = (e) => {
        const value = e.target.value.toUpperCase();
        setCurrentPokemon(prev => ({ ...prev, name: value }));
        setIsSearchOpen(value.length > 0);
    };

    // Función al hacer clic en el desplegable
    const handleSelectPokemon = async (pokeName) => {
        // Delegamos el trabajo sucio al hook
        const details = await fetchPokemonDetails(pokeName);
        
        if (details) {
            setCurrentPokemon(prev => ({
                ...prev,
                name: details.name,
                ability: details.ability,
                teraType: details.teraType
            }));
        }
        setIsSearchOpen(false); // Cierra el menú
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentPokemon(prev => ({ ...prev, [name]: value }));
    };

    const handleDone = () => {
        updatePokemon(activeTab, currentPokemon);
        navigate('/teambuilder');
    };

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

    // Filtramos la lista usando la utilidad del hook
    const filteredPokemon = getFilteredList(currentPokemon.name);

    return (
        <div className="container-fluid px-4 py-3 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <div className="editor-panel">
                
                {/* PESTAÑAS */}
                <div className="editor-tabs">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                        <div key={index} className={`editor-tab ${activeTab === index ? 'active' : ''}`} onClick={() => setActiveTab(index)}>
                            <div className="tab-circle"></div>
                        </div>
                    ))}
                </div>

                <div className="editor-body">
                    
                    {/* COLUMNA IZQUIERDA */}
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
                                        <div 
                                            key={p.name} 
                                            className="autocomplete-item"
                                            onClick={() => handleSelectPokemon(p.name)}
                                        >
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

                    {/* COLUMNA DERECHA */}
                    <div className="editor-right">
                        <div className="editor-top-inputs">
                            <input type="text" name="item" className="pill-input" placeholder="ITEM" value={currentPokemon.item} onChange={handleInputChange} />
                            <input type="text" name="teraType" className="pill-input" placeholder="TERA TYPE" value={currentPokemon.teraType} onChange={handleInputChange} />
                            <input type="text" name="ability" className="pill-input" placeholder="ABILITY" value={currentPokemon.ability} onChange={handleInputChange} />
                        </div>

                        <div className="editor-moves-grid">
                            <button className="move-btn">MOVE 1</button>
                            <button className="move-btn">MOVE 2</button>
                            <button className="move-btn">MOVE 3</button>
                            <button className="move-btn">MOVE 4</button>
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
                                <input type="text" name="nature" className="pill-input nature-input" placeholder="NATURE" value={currentPokemon.nature} onChange={handleInputChange} />
                                <button className="done-btn" onClick={handleDone}>DONE</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}