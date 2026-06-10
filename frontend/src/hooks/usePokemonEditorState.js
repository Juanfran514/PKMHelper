import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeamContext } from '../context/TeamContext';
import { usePokeAPI } from './usePokeAPI';
import { SHOWDOWN_MAPPER } from '../constants/pokemonMappings';
import { calculateMaxAllowedEv } from '../utils/statCalculations';

export const usePokemonEditorState = (activeIndex) => {
    const navigate = useNavigate();
    const { teamData, updatePokemon } = useTeamContext();
    const { 
        pokemonSprite, setPokemonSprite, loadSprite, 
        fetchPokemonDetails, getFilteredList, getSortedMoves,
        fetchBaseStats
    } = usePokeAPI();

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

    // Estados para Natures
    const [isNatureMenuOpen, setIsNatureMenuOpen] = useState(false);
    const [natureSearchTerm, setNatureSearchTerm] = useState("");

    // Estados para Habilidades
    const [isAbilityMenuOpen, setIsAbilityMenuOpen] = useState(false);
    const [availableAbilities, setAvailableAbilities] = useState([]);
    
    // Stats del Backend
    const [pokemonStats, setPokemonStats] = useState(null); 
    const [baseStats, setBaseStats] = useState(null);

    // 1. Cargar la lista completa de objetos
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
        setIsItemMenuOpen(false);
        setIsNatureMenuOpen(false);
        setIsAbilityMenuOpen(false);
    }, [activeTab, teamData.pokemon]);

    // 3. Traer datos del backend cuando el Pokémon cambia
    useEffect(() => {
        if (currentPokemon.name) {
            const nameForBackend = SHOWDOWN_MAPPER[currentPokemon.name] || currentPokemon.name;
            const backendUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/stats/${nameForBackend}`; 
            
            fetch(backendUrl)
                .then(res => {
                    if (!res.ok) throw new Error("404");
                    return res.json();
                })
                .then(data => setPokemonStats(data))
                .catch(err => setPokemonStats(null));

            fetchBaseStats(currentPokemon.name)
                .then(data => {
                    if (data) {
                        setBaseStats(data.baseStats);
                        setAvailableAbilities(data.abilities);
                    } else {
                        setBaseStats(null);
                        setAvailableAbilities([]);
                    }
                })
                .catch(err => {
                    setBaseStats(null);
                    setAvailableAbilities([]);
                });
        } else {
            setPokemonStats(null);
            setBaseStats(null);
            setAvailableAbilities([]);
        }
    }, [currentPokemon.name]);

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentPokemon(prev => ({ ...prev, [name]: value }));
    };

    const handleEvChange = (key, value) => {
        setCurrentPokemon(prev => {
            const numValue = calculateMaxAllowedEv(key, prev.evs, value);
            return { 
                ...prev, 
                evs: { ...prev.evs, [key]: numValue } 
            };
        });
    };

    const handleMoveClick = async (slotIndex) => {
        if (activeMoveSlot === slotIndex) {
            setActiveMoveSlot(null);
            return;
        }
        setActiveMoveSlot(slotIndex);
        setMoveSearchTerm("");
        setIsItemMenuOpen(false); 

        const sortedMoves = await getSortedMoves(currentPokemon.name, pokemonStats);
        setAvailableMoves(sortedMoves);
    };

    const selectMove = (moveName) => {
        const newMoves = [...currentPokemon.moves];
        newMoves[activeMoveSlot] = moveName;
        setCurrentPokemon(prev => ({ ...prev, moves: newMoves }));
        setActiveMoveSlot(null); 
    };

    const handleDone = (e) => {
        if (e) e.preventDefault();
        const pokemonToSave = {
            ...currentPokemon,
            sprite: pokemonSprite 
        };
        updatePokemon(activeTab, pokemonToSave);
        navigate('/teambuilder');
    };

    return {
        currentPokemon, setCurrentPokemon,
        activeTab, setActiveTab,
        isSearchOpen, setIsSearchOpen,
        activeMoveSlot, setActiveMoveSlot,
        moveSearchTerm, setMoveSearchTerm,
        availableMoves, setAvailableMoves,
        isItemMenuOpen, setIsItemMenuOpen,
        itemSearchTerm, setItemSearchTerm,
        allItems, setAllItems,
        isNatureMenuOpen, setIsNatureMenuOpen,
        natureSearchTerm, setNatureSearchTerm,
        isAbilityMenuOpen, setIsAbilityMenuOpen,
        availableAbilities, setAvailableAbilities,
        pokemonStats, setPokemonStats,
        baseStats, setBaseStats,
        pokemonSprite,
        handleNameChange, handleSelectPokemon,
        handleInputChange, handleEvChange,
        handleMoveClick, selectMove,
        handleDone,
        getFilteredList,
        teamData
    };
};
