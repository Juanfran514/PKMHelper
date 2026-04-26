import { useState, useEffect } from 'react';
import { createTeam, getTeamById } from '../../services/teamService'; 

export const useTeambuilder = (teamIdToLoad = null) => {
    const [teamData, setTeamData] = useState({
        teamName: '',
        trainerName: 'MiNickname',
        type: 'Public',
        pokemon: [] 
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (teamIdToLoad) {
            const fetchTeam = async () => {
                setIsLoading(true);
                try {
                    const data = await getTeamById(teamIdToLoad);
                    setTeamData(data); 
                } catch (error) {
                    console.error("Error cargando el equipo:", error);
                    alert("No se pudo cargar el equipo.");
                } finally {
                    setIsLoading(false);
                }
            };
            fetchTeam();
        }
    }, [teamIdToLoad]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTeamData(prev => ({ ...prev, [name]: value }));
    };

    // Función para guardar
    const saveTeam = async () => {
        try {
            const saved = await createTeam(teamData);
            alert(`¡Equipo "${saved.teamName}" guardado!`);
            return saved;
        } catch (error) {
            console.error(error);
            alert("Error al guardar");
        }
    };

    return { 
        teamData, 
        isLoading, 
        handleInputChange, 
        saveTeam 
    };
};