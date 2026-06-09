const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
let poolConfig = {};

if (process.env.DATABASE_URL && !process.env.POSTGRES_HOST) {
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

delete process.env.DATABASE_URL;
const pool = new Pool(poolConfig);

async function testConnection() {
    try {
        const client = await pool.connect();
        const res = await client.query('SELECT NOW()');
        
        // Update constraint to preserve match history on team deletion
        try {
            await client.query(`
                ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_team_id_fkey;
                ALTER TABLE matches ADD CONSTRAINT matches_team_id_fkey FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;
            `);
            console.log('Constraint matches_team_id_fkey actualizada a ON DELETE SET NULL');
        } catch (err) {
            console.error('Error alterando constraint matches_team_id_fkey:', err.message);
        }

        console.log('Conexión con PostgreSQL. Hora de la DB:', res.rows[0].now);
        client.release();
    } catch (error) {
        console.error('Error conectando a PostgreSQL:', error.message);
    }
}

module.exports = { pool, testConnection };