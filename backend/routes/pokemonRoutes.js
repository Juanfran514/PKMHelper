const express = require('express');
const router = express.Router();
const { pool } = require('../dbManager');

// GET Stats by Pokemon Name
router.get('/:pokemonName', async (req, res) => {
    try {
        const requestedName = req.params.pokemonName;
        const normalize = (name) => name.toLowerCase().replace(/[- ]/g, '');
        const normalizedRequest = normalize(requestedName);

        // Buscamos en PostgreSQL ignorando espacios y guiones y en minúsculas
        const query = `
            SELECT * FROM pikalytics_stats 
            WHERE REPLACE(REPLACE(LOWER(pokemon_name), '-', ''), ' ', '') = $1
        `;
        
        const dbRes = await pool.query(query, [normalizedRequest]);

        if (dbRes.rows.length === 0) {
            return res.status(404).json({ error: "No hay stats para " + requestedName });
        }

        const statsRow = dbRes.rows[0];

        // Mapeamos para que la estructura sea idéntica al JSON antiguo
        const pokemonStats = {
            name: statsRow.pokemon_name,
            usage: statsRow.usage_percent,
            set: statsRow.set_data
        };

        // 5. Si lo encuentra, se lo enviamos a React
        res.json(pokemonStats);

    } catch (error) {
        console.error("Error leyendo las stats de la BD:", error);
        res.status(500).json({ error: "Error de servidor al leer stats" });
    }
});

module.exports = router;