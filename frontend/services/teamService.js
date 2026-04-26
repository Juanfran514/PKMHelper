
const API_URL = 'http://localhost:5000/api/teams';

// GET Teams
export const getPublicTeams = async () => {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Error al obtener los equipos');
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