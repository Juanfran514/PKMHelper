const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
let poolConfig = {};

if (process.env.DATABASE_URL) {
    poolConfig = { connectionString: process.env.DATABASE_URL };
} else {
    poolConfig = {
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        host: 'localhost',
        port: 5432,
        database: process.env.POSTGRES_DB
    };
}

const pool = new Pool(poolConfig);

async function testConnection() {
    try {
        const client = await pool.connect();
        const res = await client.query('SELECT NOW()');
        console.log('Conexión con PostgreSQL. Hora de la DB:', res.rows[0].now);
        client.release();
    } catch (error) {
        console.error('Error conectando a PostgreSQL:', error.message);
    }
}

module.exports = { pool, testConnection };