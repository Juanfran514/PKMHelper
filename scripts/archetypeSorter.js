const { pool } = require('../backend/dbManager');
const { determineArchetype } = require('../backend/utils/archetypeUtils');

async function processTeams() {
    try {
        console.log("Conectando a PostgreSQL para clasificar equipos...");
        
        // Obtenemos todos los equipos para reevaluarlos
        const { rows: teamsToClassify } = await pool.query(
            "SELECT id, pokemon_list FROM teams"
        );

        if (teamsToClassify.length === 0) {
            console.log("No hay equipos para clasificar.");
            process.exit(0);
        }

        console.log(`Evaluando ${teamsToClassify.length} equipos...`);

        let updatePromises = [];

        for (const team of teamsToClassify) {
            const pokemonList = typeof team.pokemon_list === 'string' ? JSON.parse(team.pokemon_list) : team.pokemon_list;
            const archetypeString = determineArchetype(pokemonList);

            const query = "UPDATE teams SET archetype = $1 WHERE id = $2";
            updatePromises.push(pool.query(query, [archetypeString, team.id]));
        }

        await Promise.all(updatePromises);
        
        console.log(`¡Arquetipos aplicados exitosamente a ${updatePromises.length} equipos en la base de datos!`);
        process.exit(0);
    } catch (err) {
        console.error("Error crítico durante la clasificación:", err.message);
        process.exit(1);
    }
}

processTeams();
