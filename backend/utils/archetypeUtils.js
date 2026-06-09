const path = require('node:path');
const config = require('../data/archetypes.json');

function scoreCategory(teamPokemonList, categoryList, checkTrickRoomRule = false) {
    if (checkTrickRoomRule) {
        const trCount = teamPokemonList.reduce((acc, pkmn) => {
            if (!pkmn) return acc;
            const moves = Object.values(pkmn.moves || {}).map(m => typeof m === 'string' ? m.toUpperCase() : "");
            return moves.includes("TRICK ROOM") ? acc + 1 : acc;
        }, 0);
        
        if (trCount >= 2) return "Trick Room";

        const perishCount = teamPokemonList.reduce((acc, pkmn) => {
            if (!pkmn) return acc;
            const moves = Object.values(pkmn.moves || {}).map(m => typeof m === 'string' ? m.toUpperCase() : "");
            return moves.includes("PERISH SONG") ? acc + 1 : acc;
        }, 0);
        
        if (perishCount >= 1) return "Perish Trap";
    }

    let results = categoryList.map(arc => {
        let points = 0;

        // Si el arquetipo exige un setter, comprobamos si el equipo lo tiene
        if (arc.required_setters) {
            const hasSetter = teamPokemonList.some(pkmn => {
                if (!pkmn) return false;
                const pkmnName = (pkmn.name || "").toUpperCase();
                return arc.required_setters.some(setter => pkmnName.includes(setter.toUpperCase()));
            });
            
            // Si no tiene el setter requerido, no sumamos puntos y pasamos al siguiente
            if (!hasSetter) {
                return { tag: arc.tag, points: 0 };
            }
        }

        teamPokemonList.forEach(pkmn => {
            if (!pkmn) return;
            const moves = Object.values(pkmn.moves || {}).map(m => typeof m === 'string' ? m.toUpperCase() : "");
            const pkmnName = (pkmn.name || "").toUpperCase();
            const ability = (pkmn.ability || "").toUpperCase();
            const item = (pkmn.item || "").toUpperCase();

            if (arc.pokemon?.some(p => pkmnName.includes(p.toUpperCase()))) points += 10;
            if (arc.abilities?.some(a => a.toUpperCase() === ability)) points += 12;
            if (arc.moves?.some(m => moves.includes(m.toUpperCase()))) points += 7;
            if (arc.items?.some(i => i.toUpperCase() === item)) points += 3;
        });
        return { tag: arc.tag, points };
    });

    const sorted = results.sort((a, b) => b.points - a.points);
    const best = sorted[0];
    const secondBest = sorted[1];

    if (best && best.points > 0) {
        // Si hay un segundo mejor y la diferencia es pequeña, se considera empatado/ambiguo
        if (secondBest && secondBest.points > 0) {
            const diff = best.points - secondBest.points;
            if (diff < 10) {
                return "Standard"; // Empate relativo
            }
        }
        return best.tag;
    }
    return "Standard"; 
}

function determineArchetype(pokemonList) {
    if (!pokemonList || !Array.isArray(pokemonList) || pokemonList.length === 0) {
        return "Standard";
    }

    const mainTag = scoreCategory(pokemonList, config.main_archetypes, true);
    let subTag = scoreCategory(pokemonList, config.sub_archetypes, false);

    // Priorizamos Perish Trap y descartamos el clima
    if (mainTag === "Perish Trap") {
        subTag = "Standard";
    }

    const tags = [mainTag, subTag].filter(t => t !== "Standard");
    return tags.length > 0 ? tags.join(' / ') : 'Standard';
}

module.exports = {
    determineArchetype,
    scoreCategory
};
