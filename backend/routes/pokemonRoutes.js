const express = require('express');
const router = express.Router();
const { pool } = require('../dbManager');

// GET Stats by Pokemon Name
router.get('/:pokemonName', async (req, res) => {
    try {
        const requestedName = req.params.pokemonName;
        const normalize = (name) => {
            let n = name.toLowerCase().replace(/[- ]/g, '');
            if (n === 'meowstic') return 'meowsticmale';
            return n;
        };
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

// GET Base Stats by Pokemon Name from pokedex table
router.get('/base/:pokemonName', async (req, res) => {
    try {
        const requestedName = req.params.pokemonName;
        const normalize = (name) => {
            let n = name.toLowerCase().replace(/[- ]/g, '');
            if (n === 'meowstic') return 'meowsticmale';
            return n;
        };
        const normalizedRequest = normalize(requestedName);

        const query = `
            SELECT hp, atk, def, "spAtk", "spDef", spe, abilities 
            FROM pokedex 
            WHERE REPLACE(REPLACE(LOWER(name), '-', ''), ' ', '') = $1
            OR REPLACE(REPLACE(LOWER(showdown_name), '-', ''), ' ', '') = $1
        `;
        
        const dbRes = await pool.query(query, [normalizedRequest]);

        if (dbRes.rows.length === 0) {
            return res.status(404).json({ error: "No base stats found for " + requestedName });
        }

        const row = dbRes.rows[0];
        
        // Parse abilities (JSON string or array in DB)
        let parsedAbilities = [];
        try {
            if (typeof row.abilities === 'string') {
                parsedAbilities = JSON.parse(row.abilities);
            } else if (Array.isArray(row.abilities)) {
                parsedAbilities = row.abilities;
            }
        } catch(e) {
            console.error("Error parsing abilities", e);
        }

        const abilities = parsedAbilities.map(a => ({
            name: a.toUpperCase(),
            isHidden: false // In pokedexSeed it doesn't store isHidden, so default to false
        }));

        res.json({
            baseStats: {
                hp: row.hp,
                atk: row.atk,
                def: row.def,
                spa: row.spAtk,
                spd: row.spDef,
                spe: row.spe
            },
            abilities: abilities
        });

    } catch (error) {
        console.error("Error fetching base stats from DB:", error);
        res.status(500).json({ error: "Server error" });
    }
});

// GET Sprite by Pokemon Name from pokedex table
router.get('/sprite/:pokemonName', async (req, res) => {
    try {
        const requestedName = req.params.pokemonName;
        const normalize = (name) => {
            let n = name.toLowerCase().replace(/[- ]/g, '');
            if (n === 'meowstic') return 'meowsticmale';
            return n;
        };
        const normalizedRequest = normalize(requestedName);

        const query = `
            SELECT sprite FROM pokedex 
            WHERE REPLACE(REPLACE(LOWER(name), '-', ''), ' ', '') = $1
            OR REPLACE(REPLACE(LOWER(showdown_name), '-', ''), ' ', '') = $1
        `;
        
        const dbRes = await pool.query(query, [normalizedRequest]);

        if (dbRes.rows.length === 0) {
            return res.status(404).json({ error: "No sprite found" });
        }

        res.json({ sprite: dbRes.rows[0].sprite });

    } catch (error) {
        console.error("Error fetching sprite from DB:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;