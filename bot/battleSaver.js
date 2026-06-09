const { Pool } = require('pg');
const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

let poolConfig = {};
if (process.env.DATABASE_URL) {
    poolConfig = { connectionString: process.env.DATABASE_URL };
} else {
    poolConfig = {
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        host: process.env.POSTGRES_HOST || 'localhost',
        port: 5432,
        database: process.env.POSTGRES_DB
    };
}
const pool = new Pool(poolConfig);

class BattleSaver {
    constructor() {
        console.log('[SAVER] BattleSaver inicializado usando PostgreSQL.');
    }

    async getRegisteredUsers() {
        try {
            const res = await pool.query('SELECT username, "sdName" FROM "user" WHERE username IS NOT NULL AND username != \'\'');
            // Devolvemos el sdName si existe, sino el username
            return res.rows.map(row => row.sdName || row.username);
        } catch (e) {
            console.error('[SAVER] Error obteniendo usuarios registrados:', e);
            return [];
        }
    }

    async getUserId(username) {
        const query = 'SELECT id FROM "user" WHERE LOWER(username) = LOWER($1) OR LOWER("sdName") = LOWER($1)';
        const res = await pool.query(query, [username]);
        if (res.rows.length > 0) return res.rows[0].id;

        // Si no existe, creamos un usuario placeholder
        const insertQuery = 'INSERT INTO "user" (username, password, email, "sdName") VALUES ($1, $2, $3, $4) RETURNING id';
        const newRes = await pool.query(insertQuery, [username, 'no_password_bot', `${username}@bot.local`, username]);
        return newRes.rows[0].id;
    }

    async getTeamId(userId, myTeam) {
        if (!myTeam || myTeam.length === 0) return null;
        
        // Obtenemos los equipos ordenados por version descendente para priorizar la iteración más reciente
        const res = await pool.query('SELECT id, pokemon_list, version FROM teams WHERE user_id = $1 ORDER BY COALESCE(version, 1) DESC, updated_at DESC', [userId]);
        
        let bestMatchId = null;
        let bestMatchCount = -1;

        for (const row of res.rows) {
            const teamPokemons = Array.isArray(row.pokemon_list) ? row.pokemon_list.map(p => p?.name?.toLowerCase()) : [];
            const battlePokemons = myTeam.map(p => p.toLowerCase());
            
            // Verificamos cuántos Pokémon coinciden
            const matchCount = battlePokemons.filter(p => teamPokemons.some(tp => tp && (tp.includes(p) || p.includes(tp)))).length;
            
            // Nos quedamos con el que más coincida. Como están ordenados por version DESC, 
            // en caso de empate (ej: version 1 y 2 tienen los mismos 4 Pokémon usados), se queda el más reciente.
            if (matchCount > bestMatchCount) {
                bestMatchCount = matchCount;
                bestMatchId = row.id;
            }
        }
        
        // Exigimos un mínimo de coincidencias razonable (al menos la mitad de los enviados, con tope en 3)
        if (bestMatchCount >= Math.min(myTeam.length, 3) && bestMatchCount > 0) {
            return bestMatchId;
        }

        return null;
    }

    async saveBattle(username, roomID, rawLog, stats, isWin) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            const userId = await this.getUserId(username);
            const teamId = await this.getTeamId(userId, stats.myTeam);
            
            // 1. Guardar en tabla `matches`
            // Extraer nombre del oponente desde el rawLog
            const p1Match = rawLog.match(/\|player\|p1\|([^|]+)\|/);
            const p2Match = rawLog.match(/\|player\|p2\|([^|]+)\|/);
            
            let p1 = p1Match ? p1Match[1] : null;
            let p2 = p2Match ? p2Match[1] : null;
            
            let opponent = "Unknown";
            if (p1 && p1.toLowerCase() !== username.toLowerCase()) opponent = p1;
            if (p2 && p2.toLowerCase() !== username.toLowerCase()) opponent = p2;

            const formatMatch = roomID.split('-');
            const format = formatMatch.length > 1 ? formatMatch[1] : 'unknown';
            const result = isWin ? 'WIN' : 'LOSS';

            const insertMatchQuery = `
                INSERT INTO matches (user_id, team_id, opponent_name, result, log_raw, played_at)
                VALUES ($1, $2, $3, $4, $5, NOW())
            `;
            await client.query(insertMatchQuery, [userId, teamId, opponent, result, JSON.stringify(rawLog)]);

            // 2. Actualizar userStats
            const statsQuery = `
                INSERT INTO "userStats" ("playerId", format, elo, matches_played, wins, losses, updated_at)
                VALUES ($1, $2, 1000, 1, $3, $4, NOW())
                ON CONFLICT ("playerId", format) DO UPDATE SET
                    matches_played = "userStats".matches_played + 1,
                    wins = "userStats".wins + $3,
                    losses = "userStats".losses + $4,
                    updated_at = NOW()
            `;
            await client.query(statsQuery, [userId, format, isWin ? 1 : 0, isWin ? 0 : 1]);

            // 3. Si se identificó el equipo, actualizamos sus estadísticas
            if (teamId && stats.myTeam) {
                // team_pokemon_stats
                for (const pokemon of stats.myTeam) {
                    const pkmnQuery = `
                        INSERT INTO team_pokemon_stats (team_id, pokemon_name, matches_played, wins, losses)
                        VALUES ($1, $2, 1, $3, $4)
                        ON CONFLICT (team_id, pokemon_name) DO UPDATE SET
                            matches_played = team_pokemon_stats.matches_played + 1,
                            wins = team_pokemon_stats.wins + $3,
                            losses = team_pokemon_stats.losses + $4
                    `;
                    await client.query(pkmnQuery, [teamId, pokemon, isWin ? 1 : 0, isWin ? 0 : 1]);
                }

                // team_move_stats
                if (stats.moveCount) {
                    for (const pokemon in stats.moveCount) {
                        for (const move in stats.moveCount[pokemon]) {
                            const timesUsed = stats.moveCount[pokemon][move];
                            const moveQuery = `
                                INSERT INTO team_move_stats (team_id, pokemon_name, move_name, times_used)
                                VALUES ($1, $2, $3, $4)
                                ON CONFLICT (team_id, pokemon_name, move_name) DO UPDATE SET
                                    times_used = team_move_stats.times_used + $4
                            `;
                            await client.query(moveQuery, [teamId, pokemon, move, timesUsed]);
                        }
                    }
                }
            }

            await client.query('COMMIT');
            console.log(`[SAVER] Combate en ${roomID} guardado exitosamente en BD para ${username}.`);
        } catch (e) {
            await client.query('ROLLBACK');
            console.error(`[SAVER] Error guardando combate en BD:`, e);
        } finally {
            client.release();
        }
    }
}

module.exports = { BattleSaver };