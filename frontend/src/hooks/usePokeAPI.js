// src/hooks/usePokeAPI.js
import { useState, useEffect } from 'react';

export const usePokeAPI = () => {
    const [allPokemonList, setAllPokemonList] = useState([]);
    const [pokemonSprite, setPokemonSprite] = useState(null);

    useEffect(() => {
        fetch('https://pokeapi.co/api/v2/pokemon?limit=1025')
            .then(res => res.json())
            .then(data => setAllPokemonList(data.results))
            .catch(err => console.error("Error cargando la Pokedex:", err));
    }, []);

    const loadSprite = async (pokemonName) => {
        if (!pokemonName) {
            setPokemonSprite(null);
            return;
        }
        try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
            const data = await res.json();
            setPokemonSprite(data.sprites.other['official-artwork'].front_default);
        } catch (error) {
            setPokemonSprite(null);
        }
    };

    const fetchPokemonDetails = async (pokemonName) => {
        try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
            const data = await res.json();
            
            const defaultAbility = data.abilities.find(a => !a.is_hidden)?.ability.name || data.abilities[0].ability.name;
            const defaultTera = data.types[0].type.name;
            
            setPokemonSprite(data.sprites.other['official-artwork'].front_default);

            return {
                name: data.name.toUpperCase(),
                ability: defaultAbility.toUpperCase(),
                teraType: defaultTera.toUpperCase()
            };
        } catch (error) {
            console.error("Error obteniendo detalles del pokemon", error);
            return null;
        }
    };

    const getFilteredList = (searchTerm) => {
        if (!searchTerm) return [];
        return allPokemonList
            .filter(p => p.name.includes(searchTerm.toLowerCase()))
            .slice(0, 8);
    };

    // FUNCIÓN MOVIDA ARRIBA DEL RETURN
    const getSortedMoves = async (pokemonName, backendStatsData) => {
        if (!pokemonName) return { topMoves: [], otherMoves: [] };

        let allMoves = [];
        try {
            // ¡RUTA CORREGIDA! 
            // Ahora busca directamente en la raíz de la carpeta public
            const res = await fetch('/learnsets.json');
            
            // Si la respuesta no es OK, forzamos un error para que no intente parsear HTML
            if (!res.ok) throw new Error("Archivo no encontrado");
            
            const db = await res.json();
            const key = pokemonName.toUpperCase();
            allMoves = db[key] || [];
        } catch (e) {
            console.error("No se pudo cargar learnsets.json", e);
        }

        let topMoves = [];
        if (backendStatsData && backendStatsData.set && backendStatsData.set.moves) {
            const movesObj = backendStatsData.set.moves;
            topMoves = Object.keys(movesObj)
                .filter(m => m !== "Other")
                .map(m => ({
                    name: m.toUpperCase(),
                    usage: movesObj[m]
                }));
            
            topMoves.sort((a, b) => parseFloat(b.usage) - parseFloat(a.usage));
        }

        const topMoveNames = topMoves.map(m => m.name);
        const otherMoves = allMoves
            .filter(m => !topMoveNames.includes(m.toUpperCase()))
            .map(m => ({ name: m.toUpperCase(), usage: null }));

        return { topMoves, otherMoves };
    };

    return {
        pokemonSprite,
        setPokemonSprite,
        loadSprite,
        fetchPokemonDetails,
        getFilteredList,
        getSortedMoves 
    };
};