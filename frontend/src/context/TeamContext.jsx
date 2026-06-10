import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { teamService } from '../services/teamService';

const TeamContext = createContext();

export const TeamProvider = ({ children }) => {
    const { user } = useAuth();
    
    const [teamData, setTeamData] = useState({
        id: null,
        teamGroupId: null,
        version: null,
        teamName: '',
        trainerName: user?.username || 'MiNickname',
        type: 'Public',
        pokemon: Array(6).fill(null) 
    });

    useEffect(() => {
        if (user) {
            setTeamData(prev => ({ ...prev, trainerName: user.username }));
        }
    }, [user]);

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


    const saveTeamToBackend = async () => {
        try {
            const result = await teamService.saveTeam(teamData);
            
            // Actualizamos el contexto con el ID final, teamGroupId y versión
            if (result.team) {
                setTeamData(prev => ({
                    ...prev,
                    id: result.team.id,
                    teamGroupId: result.team.teamGroupId,
                    version: result.team.version
                }));
            }

            alert('¡Equipo guardado con éxito en el backend!'); 
            return result;
        } catch (error) {
            console.error('Error guardando equipo:', error);
            alert('Hubo un problema al guardar el equipo.');
        }
    };

    return (
        <TeamContext.Provider value={{ teamData, setTeamData, updateTeamDetails, updatePokemon, saveTeamToBackend }}>
            {children}
        </TeamContext.Provider>
    );
};

export const useTeamContext = () => useContext(TeamContext);