import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import PokemonSlotGrid from '../components/PokemonSlotGrid';
import TeamAnalyticsModal from '../components/TeamAnalyticsModal';
import ExportSmogonModal from '../components/ExportSmogonModal';
import { useTeamContext } from '../context/TeamContext';
import { useAuth } from '../context/AuthContext';
import { teamService } from '../services/teamService';
import '../styles/TeamBuilderPage.css';

export default function TeambuilderPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedTeamId, setSelectedTeamId] = useState("");
    const [savedTeams, setSavedTeams] = useState([]); // Aquí guardaremos los equipos del JSON
    const [showAnalytics, setShowAnalytics] = useState(false); // Estado del modal de analíticas
    const [showExport, setShowExport] = useState(false); // Estado del modal de exportar

    // Traemos setTeamData para poder sobreescribir el equipo completo de golpe
    const { teamData, setTeamData, updateTeamDetails, saveTeamToBackend } = useTeamContext();
    const { user } = useAuth();

    // Comprobar si venimos con un teamId por URL (ej: al darle a VIEW desde Meta Teams)
    const queryParams = new URLSearchParams(location.search);
    const urlTeamId = queryParams.get("teamId");

    // 1. Cargar el equipo de la URL si existe
    useEffect(() => {
        if (urlTeamId && user?.username) {
            teamService.getTeamById(urlTeamId)
                .then(data => {
                    const safePokemonList = [...(data.pokemon || [])];
                    while (safePokemonList.length < 6) safePokemonList.push(null);


                    setTeamData({
                        ...data,
                        id: null,
                        teamGroupId: null,
                        version: null,
                        teamName: `${data.teamName || 'Equipo'} (Copia)`,
                        trainerName: user.username,
                        type: 'Private', // Privado por defecto para que no contamine Meta Teams
                        pokemon: safePokemonList
                    });


                    navigate('/teambuilder', { replace: true });
                })
                .catch(err => console.error("Error cargando equipo de la URL:", err));
        }
    }, [urlTeamId, user, navigate, setTeamData]);

    // 2. Cargar equipos guardados del backend al abrir la página
    useEffect(() => {
        const currentUser = user?.username;
        if (!currentUser) return;

        teamService.getTeamsByTrainer(currentUser)
            .then(data => {
                const teamsArray = Array.isArray(data) ? data : Object.values(data);
                setSavedTeams(teamsArray);
            })
            .catch(err => console.error("Error cargando equipos del backend:", err));
    }, [user]);

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

            setTeamData({
                id: null,
                teamGroupId: null,
                version: null,
                teamName: '',
                trainerName: user?.username || 'MiNickname', // Usamos el usuario logueado
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
            while (safePokemonList.length < 6) safePokemonList.push(null);


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

        const currentUser = user?.username;
        if (!currentUser) return;

        // Recargamos la lista de equipos, pidiendo SOLO los nuestros otra vez
        teamService.getTeamsByTrainer(currentUser)
            .then(data => {
                const teamsArray = Array.isArray(data) ? data : Object.values(data);
                setSavedTeams(teamsArray);
            });
    };
    const handleDelete = async () => {
        if (!teamData.id) return;
        
        if (!window.confirm("¿Seguro que quieres borrar este equipo? Se perderán permanentemente el equipo, sus versiones y sus estadísticas de uso.")) return;

        try {
            const teamIdToDelete = teamData.teamGroupId || teamData.id;
            await teamService.deleteTeam(teamIdToDelete);

            setTeamData({
                id: null,
                teamName: '',
                type: 'Private',
                pokemon: Array(6).fill(null)
            });
            
            // Recargar equipos guardados
            const currentUser = user?.username;
            if (currentUser) {
                teamService.getTeamsByTrainer(currentUser)
                    .then(data => {
                        const teamsArray = Array.isArray(data) ? data : Object.values(data);
                        setSavedTeams(teamsArray);
                    });
            }
            
            navigate('/teambuilder');
        } catch (error) {
            console.error("Error de red:", error);
            alert("Error de conexión al intentar borrar el equipo.");
        }
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

                <div style={{ display: 'flex', gap: '10px' }}>
                    {teamData.id && (
                        <Button 
                            variant="secondary" 
                            onClick={() => setShowAnalytics(true)} 
                            style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid #555' }}
                        >
                            Ver Analíticas
                        </Button>
                    )}
                    {teamData.id && (
                        <Button 
                            variant="secondary" 
                            onClick={handleDelete} 
                            style={{ background: 'rgba(220, 38, 38, 0.2)', color: '#ef4444', border: '1px solid #ef4444' }}
                        >
                            Borrar
                        </Button>
                    )}
                    <Button 
                        variant="secondary" 
                        onClick={() => setShowExport(true)} 
                        style={{ background: 'rgba(0,0,0,0.5)', color: 'white', border: '1px solid #555' }}
                    >
                        Exportar
                    </Button>
                    <Button variant="primary" onClick={handleSubmit} style={{ background: '#1c25f6', border: 'none' }}>
                        Guardar Equipo
                    </Button>
                </div>
            </div>

            <PokemonSlotGrid
                currentPokemonList={teamData.pokemon}
                onSlotClick={handleSlotClick}
            />

            <TeamAnalyticsModal 
                show={showAnalytics} 
                onHide={() => setShowAnalytics(false)} 
                teamId={teamData.teamGroupId || teamData.id} 
            />

            <ExportSmogonModal
                show={showExport}
                onHide={() => setShowExport(false)}
            />
        </div>
    );
}