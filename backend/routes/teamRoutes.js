// backend/routes/teamRoutes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../dbManager'); // Importamos el pool de dbManager

// GET: Enviar los equipos guardados al Frontend
router.get('/', async (req, res) => {
    try {
        const { trainerName } = req.query; 

        // Modificamos la query usando ROW_NUMBER para obtener solo la versión más reciente por grupo
        let query = `
            WITH RankedTeams AS (
                SELECT t.*, u.username as trainer_name,
                       ROW_NUMBER() OVER(PARTITION BY COALESCE(t.team_group_id, t.id) ORDER BY COALESCE(t.version, 1) DESC, t.updated_at DESC) as rn
                FROM teams t 
                LEFT JOIN "user" u ON t.user_id = u.id 
                WHERE t.is_scrapped = false
            )
            SELECT * FROM RankedTeams WHERE rn = 1
        `;
        let values = [];

        if (trainerName) {
            query += ` AND trainer_name = $1`;
            values.push(trainerName);
        }

        const dbRes = await pool.query(query, values);

        // Mapeamos los resultados EXACTAMENTE como estaba el JSON anterior
        const teams = dbRes.rows.map(row => ({
            id: row.id,
            teamGroupId: row.team_group_id,
            version: row.version,
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

// POST: Recibir un equipo y guardarlo
router.post('/', async (req, res) => {
    try {
        const newTeam = req.body;
        console.log("📥 Recibiendo equipo para guardar:", newTeam.teamName);

        // Lógica de Versiones
        let teamGroupId = newTeam.teamGroupId;
        let version = 1;
        let finalId = newTeam.id;

        if (!teamGroupId) {
            // Equipo totalmente nuevo
            teamGroupId = Date.now().toString();
            finalId = `${teamGroupId}_v${version}`;
        } else {
            // Edición de un equipo existente: calculamos la nueva versión
            const versionRes = await pool.query('SELECT COALESCE(MAX(version), 0) as max_v FROM teams WHERE team_group_id = $1', [teamGroupId]);
            version = parseInt(versionRes.rows[0].max_v) + 1;
            // Si la db devuelve 1 pero el equipo viejo no tenía version, forzamos que siga la cuenta
            finalId = `${teamGroupId}_v${version}`;
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
            INSERT INTO teams (id, team_group_id, version, user_id, team_name, publicity, is_scrapped, pokemon_list, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, false, $7, $8, NOW())
            ON CONFLICT (id) DO UPDATE SET
                user_id = EXCLUDED.user_id,
                team_name = EXCLUDED.team_name,
                publicity = EXCLUDED.publicity,
                pokemon_list = EXCLUDED.pokemon_list,
                updated_at = NOW();
        `;

        const createdAt = newTeam.createdAt ? new Date(newTeam.createdAt) : new Date();

        const values = [
            finalId,
            teamGroupId,
            version,
            userId,
            newTeam.teamName || 'Nuevo Equipo',
            newTeam.type || 'Private',
            JSON.stringify(newTeam.pokemon || []),
            createdAt
        ];

        await pool.query(query, values);

        console.log(`✅ Equipo guardado exitosamente. ID: ${finalId}, Grupo: ${teamGroupId}, Versión: ${version}`);
        
        // Devolvemos el equipo actualizado para que el frontend lo reconozca
        res.status(200).json({ 
            message: 'Equipo guardado correctamente', 
            team: {
                ...newTeam,
                id: finalId,
                teamGroupId,
                version
            }
        });
        
    } catch (error) {
        console.error("❌ Error CRÍTICO al intentar guardar el equipo:", error);
        res.status(500).json({ error: "Error interno al guardar el equipo" });
    }
});

// GET: Obtener analíticas de rendimiento de un equipo o grupo de equipos
router.get('/:id/analytics', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Obtenemos los stats globales sumando todas las versiones del grupo
        const query = `
            SELECT tp.pokemon_name, 
                   SUM(tp.matches_played) as total_matches, 
                   SUM(tp.wins) as total_wins, 
                   SUM(tp.losses) as total_losses
            FROM team_pokemon_stats tp
            JOIN teams t ON tp.team_id = t.id
            WHERE t.team_group_id = $1 OR t.id = $1
            GROUP BY tp.pokemon_name
            ORDER BY total_matches DESC
        `;
        
        const dbRes = await pool.query(query, [id]);
        
        // Formateamos para el frontend
        const analytics = dbRes.rows.map(row => {
            const matches = parseInt(row.total_matches);
            const wins = parseInt(row.total_wins);
            const winRate = matches > 0 ? ((wins / matches) * 100).toFixed(1) : 0;
            return {
                pokemonName: row.pokemon_name,
                matches,
                wins,
                losses: parseInt(row.total_losses),
                winRate: parseFloat(winRate)
            };
        });
        
        res.json(analytics);
    } catch (error) {
        console.error("❌ Error obteniendo analíticas:", error);
        res.status(500).json({ error: "Error obteniendo analíticas" });
    }
});

module.exports = router;