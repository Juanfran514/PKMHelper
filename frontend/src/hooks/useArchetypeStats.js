import { useState, useEffect } from 'react';

export const useArchetypeStats = () => {
    const [stats, setStats] = useState([]);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/teams/meta/archetypes`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    // Solo cogemos el top 5 para no saturar el panel
                    setStats(data.slice(0, 5));
                }
            })
            .catch(err => console.error("Error fetching archetypes:", err));
    }, []);

    return stats;
};