const fs = require('node:fs');
const path = require('node:path');

const ARCHETYPES_PATH = path.join(__dirname, '..', 'backend', 'data', 'archetypes.json');
const INPUT_FILE = path.join(__dirname, '..', 'backend', 'data', 'teams_data.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'backend', 'data', 'classified_teams.json');


function scoreCategory(team, categoryList, checkTrickRoomRule = false) {

    if (checkTrickRoomRule) {
        const trCount = team.TEAM.reduce((acc, pkmn) => 
            Object.values(pkmn.moves).includes("Trick Room") ? acc + 1 : acc, 0);
        
        if (trCount >= 2) return "Trick Room";
    }

    let results = categoryList.map(arc => {
        let points = 0;
        team.TEAM.forEach(pkmn => {
            const moves = Object.values(pkmn.moves);
            if (arc.pokemon?.some(p => pkmn.name.includes(p))) points += 10;
            if (arc.abilities?.includes(pkmn.ability)) points += 12;
            if (arc.moves?.some(m => moves.includes(m))) points += 7;
            if (arc.items?.includes(pkmn.item)) points += 3;
        });
        return { tag: arc.tag, points };
    });

    const best = results.sort((a, b) => b.points - a.points)[0];
    return best && best.points > 0 ? best.tag : "Standard"; 
}

function processTeams() {
    try {
        const config = JSON.parse(fs.readFileSync(ARCHETYPES_PATH, 'utf8'));
        const teams = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));

        const taggedTeams = teams.map(team => {
            const mainTag = scoreCategory(team, config.main_archetypes, true);
            const subTag = scoreCategory(team, config.sub_archetypes, false);

            return {
                TeamSource: team.TeamSource,
                tags: [mainTag, subTag].filter(t => t !== "Standard")
            };
        });

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(taggedTeams, null, 2));
        console.log("Tags Aplicados en ", OUTPUT_FILE);
    } catch (err) {
        console.error("Error crítico:", err.message);
    }
}

processTeams();
