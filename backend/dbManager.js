const fs = require('node:fs/promises');
const path = require('node:path');

const dbPath = path.join(__dirname, 'teams.json');

// Lee el archivo y devuelve el array de equipos
async function getTeams() {
    try {
        const data = await fs.readFile(dbPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') return [];
        throw error;
    }
}

async function saveTeams(teamsArray) {
    await fs.writeFile(dbPath, JSON.stringify(teamsArray, null, 2));
}

module.exports = { getTeams, saveTeams };