const BASE_URL = 'http://localhost:5000/api';

export const fetchMatchLog = async (matchId) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No autorizado');

    const response = await fetch(`${BASE_URL}/users/matches/${matchId}/log`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
        throw new Error('Error al obtener la partida o no autorizada.');
    }

    const data = await response.json();
    if (!data.log) {
        throw new Error('Esta partida no tiene un log guardado.');
    }
    return data.log;
};

export const fetchPokemonSprite = async (pokemonName) => {
    if (!pokemonName || pokemonName === 'Unknown') return null;
    
    try {
        const response = await fetch(`${BASE_URL}/stats/sprite/${pokemonName}`);
        if (!response.ok) return null;
        
        const data = await response.json();
        return data.sprite || null;
    } catch (err) {
        console.error('Error fetching sprite:', err);
        return null;
    }
};
