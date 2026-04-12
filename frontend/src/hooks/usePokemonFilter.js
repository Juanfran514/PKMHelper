import { useState } from 'react';

export function usePokemonFilter(pokemonData){
    const [query, setQuery] = useState("");
    const datosFiltrados = pokemonData.filter((pokemon) => 
        pokemon.name.toLowerCase().startsWith(query.toLowerCase())
    );

    return{
        query,
        setQuery,
        datosFiltrados
    };

}
