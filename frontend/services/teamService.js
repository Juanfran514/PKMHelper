
const API_URL = `${import.meta.env.VITE_API_URL || 'https://pkmhelper-production.up.railway.app/api'}/teams`;

// GET Teams
export const getPublicTeams = async () => {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Error al obtener los equipos');
    return await response.json();
};

// GET Meta Teams (Public with filters)
export const getMetaTeams = async (tag = '', search = '') => {
    let url = `${API_URL}/meta?`;
    if (tag && tag !== 'ALL') url += `tag=${encodeURIComponent(tag)}&`;
    if (search) url += `search=${encodeURIComponent(search)}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al obtener los equipos meta');
    return await response.json();
};

// POST Team
export const createTeam = async (teamData) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(teamData)
    });
    if (!response.ok) throw new Error('Error al guardar el equipo');
    return await response.json();
};

// GET Team by id
export const getTeamById = async (id) => {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error('Error al obtener el equipo');
    return await response.json();
};

// PUT
export const updateTeam = async (id, teamData) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(teamData)
    });
    if (!response.ok) throw new Error('Error al actualizar el equipo');
    return await response.json();
};

// DELETE
export const deleteTeam = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Error al eliminar el equipo');
    return await response.json();
};