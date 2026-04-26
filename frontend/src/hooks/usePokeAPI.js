// src/hooks/usePokeAPI.js
import { useState, useEffect } from 'react';

export const usePokeAPI = () => {
    // Estados internos de la API
    const [allPokemonList, setAllPokemonList] = useState([]);
    const [pokemonSprite, setPokemonSprite] = useState(null);

    // 1. Cargar la lista completa de Pokémon solo UNA vez al iniciar
    useEffect(() => {
        fetch('https://pokeapi.co/api/v2/pokemon?limit=1025')
            .then(res => res.json())
            .then(data => setAllPokemonList(data.results))
            .catch(err => console.error("Error cargando la Pokedex:", err));
    }, []);

    // 2. Función para cargar SOLO la imagen (ideal para cuando cambias de pestaña)
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

    // 3. Función para descargar todos los datos al seleccionar del buscador
    const fetchPokemonDetails = async (pokemonName) => {
        try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
            const data = await res.json();
            
            // Lógica de negocio: extraemos habilidad y tera tipo por defecto
            const defaultAbility = data.abilities.find(a => !a.is_hidden)?.ability.name || data.abilities[0].ability.name;
            const defaultTera = data.types[0].type.name;
            
            // Actualizamos la imagen en el estado del hook
            setPokemonSprite(data.sprites.other['official-artwork'].front_default);

            // Devolvemos los datos limpios y en mayúsculas listos para guardar en el equipo
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

    // 4. Utilidad para filtrar la lista según lo que escriba el usuario (máximo 8 resultados)
    const getFilteredList = (searchTerm) => {
        if (!searchTerm) return [];
        return allPokemonList
            .filter(p => p.name.includes(searchTerm.toLowerCase()))
            .slice(0, 8);
    };

    // Devolvemos al componente solo lo que necesita usar
    return {
        pokemonSprite,
        setPokemonSprite, // Lo exportamos por si el componente necesita limpiarlo al borrar un input
        loadSprite,
        fetchPokemonDetails,
        getFilteredList
    };
};