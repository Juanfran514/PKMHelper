const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const teamService = {
    getTeamsByTrainer: async (trainerName) => {
        const response = await fetch(`${API_URL}/teams?trainerName=${trainerName}`);
        if (!response.ok) throw new Error('Error fetching teams');
        return response.json();
    },

    getTeamById: async (id) => {
        const response = await fetch(`${API_URL}/teams/single/${id}`);
        if (!response.ok) throw new Error('Error fetching team');
        return response.json();
    },

    saveTeam: async (teamData) => {
        const response = await fetch(`${API_URL}/teams`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(teamData)
        });
        if (!response.ok) throw new Error('Error saving team');
        return response.json();
    },

    deleteTeam: async (id) => {
        const response = await fetch(`${API_URL}/teams/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Error deleting team');
        return response.json();
    },

    getTeamAnalytics: async (id) => {
        const response = await fetch(`${API_URL}/teams/${id}/analytics`);
        if (!response.ok) throw new Error('Error fetching analytics');
        return response.json();
    }
};
