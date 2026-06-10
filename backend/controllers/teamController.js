const { pool } = require('../dbManager');
const { determineArchetype } = require('../utils/archetypeUtils');

const getAllTeams = async (req, res) => {
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
};

const getMetaArchetypes = async (req, res) => {
    try {
        const query = `
            WITH RankedTeams AS (
                SELECT t.archetype,
                       ROW_NUMBER() OVER(PARTITION BY COALESCE(t.team_group_id, t.id) ORDER BY COALESCE(t.version, 1) DESC, t.updated_at DESC) as rn
                FROM teams t 
                WHERE t.publicity = 'Public'
            )
            SELECT archetype FROM RankedTeams WHERE rn = 1
        `;
        const dbRes = await pool.query(query);
        const tagCounts = {};
        let totalTeams = 0;
        
        dbRes.rows.forEach(row => {
            if (row.archetype) {
                totalTeams++; // Contamos el equipo para el % total
                if (row.archetype !== 'Standard') {
                    const tags = row.archetype.split(' / ');
                    tags.forEach(tag => {
                        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
                    });
                } else {
                    tagCounts['Standard'] = (tagCounts['Standard'] || 0) + 1;
                }
            }
        });

        if (totalTeams === 0) return res.json([]);

        const statsArray = Object.keys(tagCounts).map(tag => {
            const count = tagCounts[tag];
            const percentage = ((count / totalTeams) * 100).toFixed(1); 
            return {
                name: tag,
                count: count,
                usage: Number(percentage)
            };
        });

        statsArray.sort((a, b) => b.usage - a.usage);
        res.json(statsArray);
    } catch (error) {
        console.error("❌ Error obteniendo arquetipos meta:", error);
        res.status(500).json({ error: "Error obteniendo arquetipos meta" });
    }
};

const getMetaTeams = async (req, res) => {
    try {
        const { tag, search } = req.query;
        let query = `
            WITH RankedTeams AS (
                SELECT t.*, u.username as trainer_name,
                       ROW_NUMBER() OVER(PARTITION BY COALESCE(t.team_group_id, t.id) ORDER BY COALESCE(t.version, 1) DESC, t.updated_at DESC) as rn
                FROM teams t 
                LEFT JOIN "user" u ON t.user_id = u.id 
            )
            SELECT * FROM RankedTeams WHERE rn = 1 AND publicity = 'Public'
        `;
        let values = [];
        let paramIndex = 1;

        if (tag && tag !== 'ALL') {
            if (tag.toUpperCase() === 'WEATHER') {
                query += ` AND (archetype ILIKE $${paramIndex} OR archetype ILIKE $${paramIndex+1} OR archetype ILIKE $${paramIndex+2} OR archetype ILIKE $${paramIndex+3})`;
                values.push('%Rain%', '%Sun%', '%Sand%', '%Snow%');
                paramIndex += 4;
            } else if (tag.toUpperCase() === 'TR') {
                query += ` AND archetype ILIKE $${paramIndex}`;
                values.push('%Trick Room%');
                paramIndex++;
            } else if (tag.toUpperCase() === 'HYPEROFF') {
                query += ` AND archetype ILIKE $${paramIndex}`;
                values.push('%Hyper Offense%');
                paramIndex++;
            } else if (tag.toUpperCase() === 'BALANCED') {
                query += ` AND archetype ILIKE $${paramIndex}`;
                values.push('%Balanced%');
                paramIndex++;
            } else {
                query += ` AND archetype ILIKE $${paramIndex}`;
                values.push(`%${tag}%`);
                paramIndex++;
            }
        }
        
        if (search) {
            query += ` AND (team_name ILIKE $${paramIndex} OR archetype ILIKE $${paramIndex} OR EXISTS (
                SELECT 1 FROM jsonb_array_elements(pokemon_list) AS p
                WHERE p->>'name' ILIKE $${paramIndex}
            ))`;
            values.push(`%${search}%`);
            paramIndex++;
        }

        query += ` ORDER BY created_at DESC`;

        const dbRes = await pool.query(query, values);

        const teams = dbRes.rows.map(row => ({
            id: row.id,
            trainerName: row.trainer_name || "Unknown Trainer",
            teamName: row.team_name,
            archetype: row.archetype,
            pokemon: row.pokemon_list,
            createdAt: row.created_at
        }));

        res.json(teams);
    } catch (error) {
        console.error("❌ Error leyendo equipos meta de la BD:", error);
        res.status(500).json({ error: "Error leyendo equipos meta" });
    }
};

const saveTeam = async (req, res) => {
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
            INSERT INTO teams (id, team_group_id, version, user_id, team_name, publicity, is_scrapped, pokemon_list, archetype, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, false, $7, $8, $9, NOW())
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
            finalId,
            teamGroupId,
            version,
            userId,
            newTeam.teamName || 'Nuevo Equipo',
            newTeam.type || 'Private',
            JSON.stringify(pokemonListJson),
            archetype,
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
};

const getSingleTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT t.*, u.username as trainer_name 
            FROM teams t 
            LEFT JOIN "user" u ON t.user_id = u.id 
            WHERE t.id = $1
        `;
        const dbRes = await pool.query(query, [id]);
        if (dbRes.rows.length === 0) {
            return res.status(404).json({ error: "Equipo no encontrado" });
        }
        const row = dbRes.rows[0];
        const team = {
            id: row.id,
            teamGroupId: row.team_group_id,
            version: row.version,
            trainerName: row.trainer_name || "Unknown Trainer",
            teamName: row.team_name,
            type: row.publicity,
            pokemon: row.pokemon_list,
            createdAt: row.created_at
        };
        res.json(team);
    } catch (error) {
        console.error("❌ Error leyendo equipo:", error);
        res.status(500).json({ error: "Error leyendo equipo" });
    }
};

const getTeamAnalytics = async (req, res) => {
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
        
        const moveQuery = `
            SELECT tm.pokemon_name, tm.move_name, SUM(tm.times_used) as total_used
            FROM team_move_stats tm
            JOIN teams t ON tm.team_id = t.id
            WHERE t.team_group_id = $1 OR t.id = $1
            GROUP BY tm.pokemon_name, tm.move_name
            ORDER BY total_used DESC
        `;

        const [dbRes, moveDbRes] = await Promise.all([
            pool.query(query, [id]),
            pool.query(moveQuery, [id])
        ]);
        
        // Formateamos para el frontend
        const analytics = dbRes.rows.map(row => {
            const matches = parseInt(row.total_matches);
            const wins = parseInt(row.total_wins);
            const winRate = matches > 0 ? ((wins / matches) * 100).toFixed(1) : 0;
            
            const pokemonMoves = moveDbRes.rows
                .filter(m => m.pokemon_name === row.pokemon_name)
                .map(m => ({ moveName: m.move_name, timesUsed: parseInt(m.total_used) }));

            return {
                pokemonName: row.pokemon_name,
                matches,
                wins,
                losses: parseInt(row.total_losses),
                winRate: parseFloat(winRate),
                moves: pokemonMoves
            };
        });
        
        res.json(analytics);
    } catch (error) {
        console.error("❌ Error obteniendo analíticas:", error);
        res.status(500).json({ error: "Error obteniendo analíticas" });
    }
};

const deleteTeam = async (req, res) => {
    try {
        const teamGroupId = req.params.id;
        
        // Si no es un equipo raspado, borramos todas las versiones usando team_group_id
        // Si es raspado, usaba el id normal, así que borramos por team_group_id O por id
        const deleteQuery = `
            DELETE FROM teams 
            WHERE team_group_id = $1 OR id = $1
            RETURNING id;
        `;
        
        const dbRes = await pool.query(deleteQuery, [teamGroupId]);
        
        if (dbRes.rows.length === 0) {
            return res.status(404).json({ error: "Equipo no encontrado" });
        }
        
        res.json({ message: "Equipo y sus estadísticas eliminados correctamente", deletedCount: dbRes.rows.length });
    } catch (error) {
        console.error("Error al borrar equipo:", error);
        res.status(500).json({ error: "Error interno al borrar equipo" });
    }
};

module.exports = {
    getAllTeams,
    getMetaArchetypes,
    getMetaTeams,
    saveTeam,
    getSingleTeam,
    getTeamAnalytics,
    deleteTeam
};
