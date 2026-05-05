import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import PokemonSlotGrid from '../components/PokemonSlotGrid';
import { useTeamContext } from '../context/TeamContext';
import '../styles/TeambuilderPage.css';

export default function TeambuilderPage() {
    const navigate = useNavigate();
    const [selectedTeamId, setSelectedTeamId] = useState(""); 
    const [savedTeams, setSavedTeams] = useState([]); // Aquí guardaremos los equipos del JSON
    
    // Traemos setTeamData para poder sobreescribir el equipo completo de golpe
    const { teamData, setTeamData, updateTeamDetails, saveTeamToBackend } = useTeamContext();

    // 1. Cargar equipos del backend al abrir la página
// 1. Cargar equipos del backend al abrir la página
    useEffect(() => {
        // Le pasamos el nombre del usuario actual como parámetro en la URL
        const currentUser = teamData.trainerName; 

        fetch(`http://localhost:5000/api/teams?trainerName=${currentUser}`)
            .then(res => res.json())
            .then(data => {
                const teamsArray = Array.isArray(data) ? data : Object.values(data);
                setSavedTeams(teamsArray);
            })
            .catch(err => console.error("Error cargando equipos del backend:", err));
    }, []); 

    const handleSlotClick = (index, pokemon) => {
        navigate(`/teambuilder/editor/${index}`);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        updateTeamDetails(name, value);
    };

    // 2. Manejar la selección del menú desplegable
    const handleTeamSelect = (e) => {
        const selectedValue = e.target.value;
        setSelectedTeamId(selectedValue);

        if (!selectedValue) {
            // Si elige "Crear Nuevo Equipo", limpiamos la pantalla
            setTeamData({
                teamName: '',
                trainerName: 'MiNickname', // O el nombre que tengas por defecto
                type: 'Public',
                pokemon: Array(6).fill(null)
            });
            return;
        }

        // Buscamos el equipo en la lista que nos dio el backend
        const selectedTeam = savedTeams.find(t => t.teamName === selectedValue || t.id === selectedValue);
        
        if (selectedTeam) {
            // Nos aseguramos de que el array tenga siempre 6 huecos aunque se haya guardado con menos
            const safePokemonList = [...(selectedTeam.pokemon || [])];
            while(safePokemonList.length < 6) safePokemonList.push(null);
            
            // ¡Inyectamos el equipo recuperado en el Teambuilder!
            setTeamData({
                ...selectedTeam,
                pokemon: safePokemonList
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!teamData.teamName.trim()) {
            alert("Por favor, ponle un nombre a tu equipo antes de guardar.");
            return;
        }

        await saveTeamToBackend();
        
        const currentUser = teamData.trainerName;
        
        // Recargamos la lista de equipos, pidiendo SOLO los nuestros otra vez
        fetch(`http://localhost:5000/api/teams?trainerName=${currentUser}`)
            .then(res => res.json())
            .then(data => {
                const teamsArray = Array.isArray(data) ? data : Object.values(data);
                setSavedTeams(teamsArray);
            });
    };

    return (
        <div className="container-fluid px-4 py-3" style={{ color: 'white' }}>

            <div className="teambuilder-header">
                <div className="teambuilder-controls">
                    <Form.Select 
                        style={{ width: '200px', background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid #555' }}
                        value={selectedTeamId}
                        onChange={handleTeamSelect}
                    >
                        <option value="">Crear Nuevo Equipo</option>
                        {/* 3. Mapeamos los equipos reales desde el backend */}
                        {savedTeams.map((team, idx) => (
                            <option key={team.id || idx} value={team.teamName || team.id}>
                                {team.teamName || `Equipo ${idx + 1}`}
                            </option>
                        ))}
                    </Form.Select>

                    <Form.Control 
                        type="text" 
                        name="teamName" 
                        placeholder="Nombre del Equipo..." 
                        value={teamData.teamName} 
                        onChange={handleInputChange}
                        style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid #555', width: '250px' }}
                        autoComplete="off"
                    />

                    <Form.Select 
                        name="type" 
                        value={teamData.type} 
                        onChange={handleInputChange}
                        style={{ width: '150px', background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid #555' }}
                    >
                        <option value="Public">Público</option>
                        <option value="Private">Privado</option>
                    </Form.Select>
                </div>

                <Button variant="primary" onClick={handleSubmit} style={{ background: '#1c25f6', border: 'none' }}>
                    Guardar Equipo
                </Button>
            </div>

            <PokemonSlotGrid 
                currentPokemonList={teamData.pokemon} 
                onSlotClick={handleSlotClick} 
            />

        </div>
    );
}