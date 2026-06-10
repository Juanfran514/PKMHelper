const express = require('express');
const router = express.Router();
const { pool } = require('../dbManager');
const { verifyToken } = require('../middleware/authMiddleware');

// GET /api/users/profile
// Obtiene la información del perfil del usuario logeado
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            'SELECT id, username, email, "sdName" FROM "user" WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// PUT /api/users/profile
// Actualiza la información del perfil del usuario logeado
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, email, sdName } = req.body;

        if (!username || !email) {
            return res.status(400).json({ error: 'Username and email are required.' });
        }

        // Verificar si el nuevo username o email ya está en uso por otro usuario
        const existingUser = await pool.query(
            'SELECT id FROM "user" WHERE (username = $1 OR email = $2) AND id != $3',
            [username, email, userId]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'Username or Email is already in use by another account.' });
        }

        const result = await pool.query(
            'UPDATE "user" SET username = $1, email = $2, "sdName" = $3 WHERE id = $4 RETURNING id, username, email, "sdName"',
            [username, email, sdName || null, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.json({
            message: 'Profile updated successfully',
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// GET /api/users/matches
// Obtiene el historial de partidas del usuario logeado
router.get('/matches', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            `SELECT m.id, m.opponent_name, m.result, m.played_at, t.team_name
             FROM matches m 
             LEFT JOIN teams t ON m.team_id = t.id 
             WHERE m.user_id = $1 
             ORDER BY m.played_at DESC`,
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching matches:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// GET /api/users/stats
// Obtiene estadísticas generales del usuario
router.get('/stats', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            `SELECT SUM(matches_played) as total_matches, SUM(wins) as total_wins 
             FROM "userStats" 
             WHERE "playerId" = $1`,
            [userId]
        );
        
        let winrate = "0%";
        let elo = 1500; // Por defecto
        let glicko = 1600; // Por defecto
        
        if (result.rows.length > 0 && result.rows[0].total_matches > 0) {
            const wins = parseInt(result.rows[0].total_wins) || 0;
            const matches = parseInt(result.rows[0].total_matches) || 0;
            winrate = Math.round((wins / matches) * 100) + "%";
        }

        res.json({ elo, winrate, glicko });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// GET /api/users/matches/:id/log
// Obtiene el log raw de una partida concreta
router.get('/matches/:id/log', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const matchId = req.params.id;
        
        const result = await pool.query(
            `SELECT log_raw FROM matches WHERE id = $1 AND user_id = $2`,
            [matchId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Match not found or unauthorized.' });
        }

        res.json({ log: result.rows[0].log_raw });
    } catch (error) {
        console.error('Error fetching match log:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
