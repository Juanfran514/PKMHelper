// backend/routes/teamRoutes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../dbManager'); // Importamos el pool de dbManager
const { determineArchetype } = require('../utils/archetypeUtils');

// GET: Enviar los equipos guardados al Frontend
router.get('/', async (req, res) => {
    try {
        const { trainerName } = req.query; 

        // Modificamos la query dependiendo de si nos piden un entrenador concreto
        let query = `
            SELECT t.*, u.username as trainer_name 
            FROM teams t 
            LEFT JOIN "user" u ON t.user_id = u.id 
            WHERE t.is_scrapped = false
        `;
        let values = [];

        if (trainerName) {
            query += ` AND u.username = $1`;
            values.push(trainerName);
        }

        const dbRes = await pool.query(query, values);

        // Mapeamos los resultados EXACTAMENTE como estaba el JSON anterior
        const teams = dbRes.rows.map(row => ({
            id: row.id,
            trainerName: row.trainer_name || "Unknown Trainer",
            teamName: row.team_name,
            type: row.publicity,
            pokemon: row.pokemon_list,
            createdAt: row.created_at
        }));

        res.json(teams);
    } catch (error) {
        console.error("❌ Error leyendo equipos de la BD:", error);
        res.status(500).json({ error: "Error leyendo equipos" });
    }
});

// GET: Enviar equipos meta (públicos)
router.get('/meta', async (req, res) => {
    try {
        const { tag, search } = req.query;
        let query = `
            SELECT t.*, u.username as trainer_name 
            FROM teams t 
            LEFT JOIN "user" u ON t.user_id = u.id 
            WHERE t.publicity = 'Public'
        `;
        let values = [];
        let paramIndex = 1;

        if (tag && tag !== 'ALL') {
            if (tag.toUpperCase() === 'WEATHER') {
                query += ` AND (t.archetype ILIKE $${paramIndex} OR t.archetype ILIKE $${paramIndex+1} OR t.archetype ILIKE $${paramIndex+2} OR t.archetype ILIKE $${paramIndex+3})`;
                values.push('%Rain%', '%Sun%', '%Sand%', '%Snow%');
                paramIndex += 4;
            } else if (tag.toUpperCase() === 'TR') {
                query += ` AND t.archetype ILIKE $${paramIndex}`;
                values.push('%Trick Room%');
                paramIndex++;
            } else if (tag.toUpperCase() === 'HYPEROFF') {
                query += ` AND t.archetype ILIKE $${paramIndex}`;
                values.push('%Hyper Offense%');
                paramIndex++;
            } else if (tag.toUpperCase() === 'BALANCED') {
                query += ` AND t.archetype ILIKE $${paramIndex}`;
                values.push('%Balanced%');
                paramIndex++;
            } else {
                query += ` AND t.archetype ILIKE $${paramIndex}`;
                values.push(`%${tag}%`);
                paramIndex++;
            }
        }
        
        if (search) {
            query += ` AND (t.team_name ILIKE $${paramIndex} OR t.archetype ILIKE $${paramIndex} OR EXISTS (
                SELECT 1 FROM jsonb_array_elements(t.pokemon_list) AS p
                WHERE p->>'name' ILIKE $${paramIndex}
            ))`;
            values.push(`%${search}%`);
            paramIndex++;
        }

        query += ` ORDER BY t.likes DESC NULLS LAST`;

        const dbRes = await pool.query(query, values);

        const teams = dbRes.rows.map(row => ({
            id: row.id,
            trainerName: row.trainer_name || "Unknown Trainer",
            teamName: row.team_name,
            archetype: row.archetype,
            likes: row.likes,
            pokemon: row.pokemon_list,
            createdAt: row.created_at
        }));

        res.json(teams);
    } catch (error) {
        console.error("❌ Error leyendo equipos meta de la BD:", error);
        res.status(500).json({ error: "Error leyendo equipos meta" });
    }
});

// POST: Recibir un equipo y guardarlo
router.post('/', async (req, res) => {
    try {
        const newTeam = req.body;
        console.log("📥 Recibiendo equipo para guardar:", newTeam.teamName);

        // Le generamos un ID único si no lo tiene
        if (!newTeam.id) {
            newTeam.id = Date.now().toString();
        }

        let userId = null;
        if (newTeam.trainerName) {
            // Comprobamos si el usuario existe
            const userRes = await pool.query('SELECT id FROM "user" WHERE username = $1', [newTeam.trainerName]);
            if (userRes.rows.length > 0) {
                userId = userRes.rows[0].id;
            } else {
                // Creamos usuario ficticio para mantener el trainerName
                const insertUserRes = await pool.query(
                    'INSERT INTO "user" (username, password, email) VALUES ($1, $2, $3) RETURNING id',
                    [newTeam.trainerName, 'no_password_created_via_api', `${newTeam.trainerName}@api.local`]
                );
                userId = insertUserRes.rows[0].id;
            }
        }

        const query = `
            INSERT INTO teams (id, user_id, team_name, publicity, is_scrapped, pokemon_list, archetype, created_at, updated_at)
            VALUES ($1, $2, $3, $4, false, $5, $6, $7, NOW())
            ON CONFLICT (id) DO UPDATE SET
                user_id = EXCLUDED.user_id,
                team_name = EXCLUDED.team_name,
                publicity = EXCLUDED.publicity,
                pokemon_list = EXCLUDED.pokemon_list,
                archetype = EXCLUDED.archetype,
                updated_at = NOW();
        `;

        const createdAt = newTeam.createdAt ? new Date(newTeam.createdAt) : new Date();
        const pokemonListJson = newTeam.pokemon || [];
        const archetype = determineArchetype(pokemonListJson);

        const values = [
            newTeam.id,
            userId,
            newTeam.teamName || 'Nuevo Equipo',
            newTeam.type || 'Private',
            JSON.stringify(pokemonListJson),
            archetype,
            createdAt
        ];

        await pool.query(query, values);

        console.log("✅ Equipo guardado o actualizado en la base de datos.");
        
        // Le avisamos al Frontend de que todo ha ido bien
        res.status(200).json({ message: 'Equipo guardado correctamente', team: newTeam });
        
    } catch (error) {
        console.error("❌ Error CRÍTICO al intentar guardar el equipo:", error);
        res.status(500).json({ error: "Error interno al guardar el equipo" });
    }
});

module.exports = router;