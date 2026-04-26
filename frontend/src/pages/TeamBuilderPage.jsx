// src/pages/TeambuilderPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Spinner } from 'react-bootstrap';
import PokemonSlotGrid from '../components/PokemonSlotGrid';
import '../styles/TeambuilderPage.css';

import { useTeambuilder } from '../hooks/useTeambuilder';

export default function TeambuilderPage() {
    const navigate = useNavigate();
    const [selectedTeamId, setSelectedTeamId] = useState(null); 
    
    const { teamData, isLoading, handleInputChange, saveTeam } = useTeambuilder(selectedTeamId);

    const handleSlotClick = (index, pokemon) => {
        navigate(`/teambuilder/editor/${index}`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await saveTeam();
    };

    if (isLoading) {
        return <div className="text-center mt-5 text-white"><Spinner animation="border" /> Cargando equipo...</div>;
    }

    return (
        <div className="container-fluid px-4 py-3" style={{ color: 'white' }}>

            <div className="teambuilder-header">
                <div className="teambuilder-controls">
                    <Form.Select 
                        style={{ width: '200px', background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid #555' }}
                        onChange={(e) => setSelectedTeamId(e.target.value || null)}
                    >
                        <option value="">Crear Nuevo Equipo</option>
                        {/* En el futuro, aquí mapearemos tus equipos guardados desde el backend */}
                        <option value="65a1b2c3d4e5">Lluvia Destructiva (Ejemplo ID)</option>
                    </Form.Select>

                    <Form.Control 
                        type="text" name="teamName" placeholder="Nombre del Equipo..." 
                        value={teamData.teamName} onChange={handleInputChange}
                        style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid #555', width: '250px' }}
                    />

                    <Form.Select 
                        name="type" value={teamData.type} onChange={handleInputChange}
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