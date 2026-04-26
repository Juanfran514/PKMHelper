import React, { createContext, useState, useContext } from 'react';

const TeamContext = createContext();

export const TeamProvider = ({ children }) => {
    const [teamData, setTeamData] = useState({
        teamName: '',
        trainerName: 'MiNickname',
        type: 'Public',
        pokemon: Array(6).fill(null) 
    });

    const updateTeamDetails = (name, value) => {
        setTeamData(prev => ({ ...prev, [name]: value }));
    };

    const updatePokemon = (index, pokemonData) => {
        setTeamData(prev => {
            const newPokemonList = [...prev.pokemon];
            newPokemonList[index] = pokemonData;
            return { ...prev, pokemon: newPokemonList };
        });
    };

    return (
        <TeamContext.Provider value={{ teamData, setTeamData, updateTeamDetails, updatePokemon }}>
            {children}
        </TeamContext.Provider>
    );
};

export const useTeamContext = () => useContext(TeamContext);