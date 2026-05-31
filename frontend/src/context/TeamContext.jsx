import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const TeamContext = createContext();

export const TeamProvider = ({ children }) => {
    const { user } = useAuth();
    
    const [teamData, setTeamData] = useState({
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

    // NUEVO: Función para enviar el equipo al Backend
    const saveTeamToBackend = async () => {
        try {
            // Asegúrate de que el puerto (5000) sea el de tu backend
            const response = await fetch('http://localhost:5000/api/teams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(teamData)
            });

            if (!response.ok) {
                throw new Error('Error en el servidor al guardar');
            }

            const result = await response.json();
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