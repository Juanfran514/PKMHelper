const { pool } = require('../backend/dbManager');
const path = require('node:path');

// Cargamos el config directamente con require para no usar fs
const config = require('../backend/data/archetypes.json');

function scoreCategory(teamPokemonList, categoryList, checkTrickRoomRule = false) {
    if (checkTrickRoomRule) {
        const trCount = teamPokemonList.reduce((acc, pkmn) => {
            if (!pkmn) return acc;
            const moves = Object.values(pkmn.moves || {});
            return moves.includes("Trick Room") ? acc + 1 : acc;
        }, 0);
        
        if (trCount >= 2) return "Trick Room";
    }

    let results = categoryList.map(arc => {
        let points = 0;
        teamPokemonList.forEach(pkmn => {
            if (!pkmn) return;
            const moves = Object.values(pkmn.moves || {});
            const pkmnName = pkmn.name || "";
            if (arc.pokemon?.some(p => pkmnName.includes(p))) points += 10;
            if (arc.abilities?.includes(pkmn.ability)) points += 12;
            if (arc.moves?.some(m => moves.includes(m))) points += 7;
            if (arc.items?.includes(pkmn.item)) points += 3;
        });
        return { tag: arc.tag, points };
    });

    const best = results.sort((a, b) => b.points - a.points)[0];
    return best && best.points > 0 ? best.tag : "Standard"; 
}

async function processTeams() {
    try {
        console.log("Conectando a PostgreSQL para clasificar equipos...");
        
        // Obtenemos solo los equipos que no tienen arquetipo
        const { rows: teamsToClassify } = await pool.query(
            "SELECT id, pokemon_list FROM teams WHERE archetype IS NULL"
        );

        if (teamsToClassify.length === 0) {
            console.log("No hay equipos sin clasificar.");
            process.exit(0);
        }

        console.log(`Encontrados ${teamsToClassify.length} equipos para clasificar.`);

        let updatePromises = [];

        for (const team of teamsToClassify) {
            const pokemonList = typeof team.pokemon_list === 'string' ? JSON.parse(team.pokemon_list) : team.pokemon_list;
            
            // Si el team no tiene pokemon, saltamos
            if (!pokemonList || !Array.isArray(pokemonList) || pokemonList.length === 0) {
                continue;
            }

            const mainTag = scoreCategory(pokemonList, config.main_archetypes, true);
            const subTag = scoreCategory(pokemonList, config.sub_archetypes, false);

            const tags = [mainTag, subTag].filter(t => t !== "Standard");
            const archetypeString = tags.length > 0 ? tags.join(' / ') : 'Standard';

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
