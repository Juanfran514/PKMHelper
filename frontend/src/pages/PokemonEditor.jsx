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
    
    // Estados para Movimientos
    const [activeMoveSlot, setActiveMoveSlot] = useState(null);
    const [moveSearchTerm, setMoveSearchTerm] = useState("");
    const [availableMoves, setAvailableMoves] = useState({ topMoves: [], otherMoves: [] });
    
    // Estados para Objetos
    const [isItemMenuOpen, setIsItemMenuOpen] = useState(false);
    const [itemSearchTerm, setItemSearchTerm] = useState("");
    const [allItems, setAllItems] = useState([]);
    
    // Stats del Backend
    const [pokemonStats, setPokemonStats] = useState(null); 

    const { 
        pokemonSprite, setPokemonSprite, loadSprite, 
        fetchPokemonDetails, getFilteredList, getSortedMoves 
    } = usePokeAPI();

    // 1. Cargar la lista completa de objetos (solo una vez)
    useEffect(() => {
        fetch('/items.json')
            .then(res => {
                if (!res.ok) throw new Error("Archivo items.json no encontrado");
                return res.json();
            })
            .then(data => setAllItems(data))
            .catch(err => console.error("Error cargando items.json", err));
    }, []);

    // 2. Cargar el estado al cambiar de pestaña
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
        setIsItemMenuOpen(false); // Cerramos menú de items al cambiar pestaña
    }, [activeTab, teamData.pokemon]);

    // 3. Traer datos del backend cuando el Pokémon cambia (Con traductor)
    useEffect(() => {
        if (currentPokemon.name) {
            // Diccionario para que la API coincida con tu backend
            const showdownMapper = {
                "TORNADUS-INCARNATE": "Tornadus",
                "THUNDURUS-INCARNATE": "Thundurus",
                "LANDORUS-INCARNATE": "Landorus",
                "ENAMORUS-INCARNATE": "Enamorus",
                "URSHIFU-SINGLE-STRIKE": "Urshifu",
                "INDEEDEE-MALE": "Indeedee",
                "MEOWSTIC-MALE": "Meowstic",
                "BASCULEGION-MALE": "Basculegion",
                "OINKOLOGNE-MALE": "Oinkologne"
            };

            const nameForBackend = showdownMapper[currentPokemon.name] || currentPokemon.name;
            const backendUrl = `http://localhost:5000/api/stats/${nameForBackend}`; 
            
            fetch(backendUrl)
                .then(res => {
                    if (!res.ok) throw new Error("404");
                    return res.json();
                })
                .then(data => setPokemonStats(data))
                .catch(err => setPokemonStats(null));
        } else {
            setPokemonStats(null);
        }
    }, [currentPokemon.name]);

    // 4. Buscador de Nombre de Pokémon
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
                moves: ['', '', '', ''], 
                item: '' 
            }));
        }
        setIsSearchOpen(false); 
    };

    // 5. Manejadores de Inputs Generales
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentPokemon(prev => ({ ...prev, [name]: value }));
    };

    const handleDone = (e) => {
        if (e) e.preventDefault(); // Evita recargas si el botón se comporta raro
        
        // 1. Juntamos los datos del Pokémon y su foto en un solo objeto
        const pokemonToSave = {
            ...currentPokemon,
            sprite: pokemonSprite // <-- LA FOTO PARA QUE EL GRID LO DIBUJE
        };

        // 2. Imprimimos en consola para asegurarnos de que no está vacío
        console.log("Guardando en el hueco", activeTab, ":", pokemonToSave);

        // 3. Enviamos el paquete al Contexto
        updatePokemon(activeTab, pokemonToSave);
        
        // 4. Volvemos al Teambuilder
        navigate('/teambuilder');
    };

    // 6. Lógica de EVs (Límite 32 por stat, 68 global)
    const evStatsMap = [
        { label: 'HP', key: 'hp' }, { label: 'ATK', key: 'atk' }, { label: 'DEF', key: 'def' },
        { label: 'SPATK', key: 'spa' }, { label: 'SPDEF', key: 'spd' }, { label: 'SPE', key: 'spe' }
    ];

    const handleEvChange = (key, value) => {
        let numValue = parseInt(value, 10) || 0;

        setCurrentPokemon(prev => {
            const currentEvs = prev.evs;
            
            // Calculamos la suma de todos los EVs actuales EXCEPTO el que estamos moviendo ahora
            let otherEvsSum = 0;
            for (let stat in currentEvs) {
                if (stat !== key) {
                    otherEvsSum += currentEvs[stat];
                }
            }

            // Calculamos el máximo real permitido para este stat. 
            const maxAllowed = Math.min(32, 68 - otherEvsSum);

            // Ajustamos el valor ingresado para que no rompa las reglas
            if (numValue > maxAllowed) numValue = maxAllowed;
            if (numValue < 0) numValue = 0;

            return { 
                ...prev, 
                evs: { ...prev.evs, [key]: numValue } 
            };
        });
    };

    // Calculamos los EVs totales gastados y restantes para la interfaz visual
    const totalEvsSpent = Object.values(currentPokemon.evs).reduce((a, b) => a + b, 0);
    const evsRemaining = 68 - totalEvsSpent;

    // 7. Lógica de los Movimientos
    const handleMoveClick = async (slotIndex) => {
        if (activeMoveSlot === slotIndex) {
            setActiveMoveSlot(null);
            return;
        }
        setActiveMoveSlot(slotIndex);
        setMoveSearchTerm("");
        setIsItemMenuOpen(false); // Cerramos items si abre ataques

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

    // 8. Calcular los Top Items para el menú desplegable
    let topItems = [];
    if (pokemonStats && pokemonStats.set && pokemonStats.set.items) {
        const itemsObj = pokemonStats.set.items;
        topItems = Object.keys(itemsObj)
            .filter(i => i !== "Other")
            .map(i => ({
                name: i.toUpperCase(),
                usage: itemsObj[i]
            }))
            .sort((a, b) => parseFloat(b.usage) - parseFloat(a.usage));
    }

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
                        
                        {/* INPUTS SUPERIORES: ITEM, TERA, ABILITY */}
                        <div className="editor-top-inputs" style={{ display: 'flex', gap: '10px' }}>
                            
                            {/* CONTENEDOR DEL ITEM CON DESPLEGABLE */}
                            <div style={{ position: 'relative', flex: 1 }}>
                                <input 
                                    type="text" 
                                    name="item" 
                                    className="pill-input w-100" 
                                    placeholder="ITEM" 
                                    value={isItemMenuOpen ? itemSearchTerm : currentPokemon.item} 
                                    onChange={(e) => {
                                        if (isItemMenuOpen) {
                                            setItemSearchTerm(e.target.value);
                                        } else {
                                            handleInputChange(e);
                                        }
                                    }} 
                                    onClick={() => {
                                        setIsItemMenuOpen(true);
                                        setItemSearchTerm("");
                                        setActiveMoveSlot(null); // Cerramos ataques si abre items
                                    }}
                                    autoComplete="off" 
                                />

                                {/* DROPDOWN DE ITEMS */}
                                {isItemMenuOpen && (
                                    <div className="move-dropdown" style={{ zIndex: 100 }}>
                                        <div className="move-list-container">
                                            
                                            {/* SECCIÓN MÁS USADOS (Backend) */}
                                            {topItems.filter(i => i.name.includes(itemSearchTerm.toUpperCase())).length > 0 && (
                                                <>
                                                    <div className="move-category-title">⭐ OBJETOS MÁS USADOS</div>
                                                    {topItems
                                                        .filter(i => i.name.includes(itemSearchTerm.toUpperCase()))
                                                        .map(i => (
                                                            <div 
                                                                key={i.name} 
                                                                className="move-item top-move" 
                                                                onClick={() => {
                                                                    setCurrentPokemon(prev => ({ ...prev, item: i.name }));
                                                                    setIsItemMenuOpen(false);
                                                                }}
                                                            >
                                                                <span>{i.name}</span>
                                                                <span className="move-usage">{i.usage}</span>
                                                            </div>
                                                        ))
                                                    }
                                                </>
                                            )}

                                            {/* SECCIÓN RESTO DE OBJETOS (items.json) */}
                                            <div className="move-category-title">RESTO DE OBJETOS</div>
                                            {allItems
                                                .filter(item => 
                                                    item.includes(itemSearchTerm.toUpperCase()) && 
                                                    !topItems.some(top => top.name === item) 
                                                )
                                                .map(item => (
                                                    <div 
                                                        key={item} 
                                                        className="move-item" 
                                                        onClick={() => {
                                                            setCurrentPokemon(prev => ({ ...prev, item: item }));
                                                            setIsItemMenuOpen(false);
                                                        }}
                                                    >
                                                        {item}
                                                    </div>
                                                ))
                                            }

                                            {/* BOTÓN CERRAR MENÚ */}
                                            <div 
                                                className="move-item" 
                                                style={{ textAlign: 'center', color: '#ff6b6b', marginTop: '10px' }}
                                                onClick={() => setIsItemMenuOpen(false)}
                                            >
                                                ✖ Cerrar menú
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <input type="text" name="teraType" className="pill-input" placeholder="TERA TYPE" value={currentPokemon.teraType} onChange={handleInputChange} autoComplete="off" style={{ flex: 1 }} />
                            <input type="text" name="ability" className="pill-input" placeholder="ABILITY" value={currentPokemon.ability} onChange={handleInputChange} autoComplete="off" style={{ flex: 1 }} />
                        </div>

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
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                                    <div className={`ev-counter ${evsRemaining === 0 ? 'empty' : ''}`}>
                                        PUNTOS: {evsRemaining}/68
                                    </div>
                                    <input type="text" name="nature" className="pill-input nature-input" placeholder="NATURE" value={currentPokemon.nature} onChange={handleInputChange} autoComplete="off" />
                                </div>
                                <button type="button" className="done-btn" onClick={handleDone}>DONE</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}