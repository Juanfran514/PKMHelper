class Team {
    constructor({ id, trainerName, teamName, pokemon = [], type }) {
        this.id = id || Date.now().toString(); 
        this.trainerName = trainerName || "Unknown Trainer"; 
        this.teamName = teamName || "Nuevo Equipo";
        this.type = type || "Private";
        
        const limitedPokemon = pokemon.slice(0, 6);
        this.pokemon = limitedPokemon.map(p => this.formatPokemon(p));
        
        this.createdAt = new Date();
    }

    formatPokemon(p) {
        let formattedEvs = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
        let nature = "Serious";

        if (p.set?.evs) {
            nature = Object.keys(p.set.evs)[0] || "Serious";
            const evValues = p.set.evs[nature].split('//').map(Number);
            
            formattedEvs = {
                hp: evValues[0] || 0,
                atk: evValues[1] || 0,
                def: evValues[2] || 0,
                spa: evValues[3] || 0,
                spd: evValues[4] || 0,
                spe: evValues[5] || 0
            };
        } else if (p.evs) {
            formattedEvs = { ...formattedEvs, ...p.evs };
            nature = p.nature || "Serious";
        }

        const defaultMoves = ["", "", "", ""];
        const parsedMoves = Array.isArray(p.moves) ? p.moves : [];
        const finalMoves = [...parsedMoves, ...defaultMoves].slice(0, 4);

        return {
            name: p.name || "Unknown",
            item: p.item || "None",
            ability: p.ability || "None",
            nature: nature,
            evs: formattedEvs,
            moves: finalMoves, 
            teraType: p.teraType || "Normal",
        };
    }
}

module.exports = Team;