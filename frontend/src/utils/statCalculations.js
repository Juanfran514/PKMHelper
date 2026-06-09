import { POKEMON_NATURES } from '../constants/natures';

export const calculatePokemonStat = (statKey, baseStats, currentPokemon) => {
    if (!baseStats) return "-";
    
    const base = baseStats[statKey];
    if (base === undefined) return "-";
    
    const ev = currentPokemon?.evs?.[statKey] || 0;
    const iv = 31; // Asumimos IVs perfectos (31)
    const level = 50;

    if (statKey === 'hp') {
        const baseHp = Math.floor(((2 * base + iv) * level) / 100) + level + 10;
        return baseHp + ev;
    } else {
        const natureName = (currentPokemon?.nature || "").toUpperCase();
        const currentNatureObj = POKEMON_NATURES.find(n => (n.name || "").toUpperCase() === natureName);
        
        let multiplier = 1.0;
        if (currentNatureObj) {
            const natureStatMap = { 'atk': 'Atk', 'def': 'Def', 'spa': 'SpA', 'spd': 'SpD', 'spe': 'Spe' };
            const natureKey = natureStatMap[statKey];
            if (currentNatureObj.plus === natureKey) multiplier = 1.1;
            if (currentNatureObj.minus === natureKey) multiplier = 0.9;
        }
        
        const rawStat = Math.floor(((2 * base + iv) * level) / 100) + 5;
        return Math.floor(rawStat * multiplier) + ev;
    }
};

export const calculateEvsRemaining = (currentEvs) => {
    const totalEvsSpent = Object.values(currentEvs).reduce((a, b) => a + b, 0);
    return 66 - totalEvsSpent;
};

export const calculateMaxAllowedEv = (statKey, currentEvs, requestedValue) => {
    let otherEvsSum = 0;
    for (let stat in currentEvs) {
        if (stat !== statKey) {
            otherEvsSum += currentEvs[stat];
        }
    }

    const maxAllowed = Math.min(32, 66 - otherEvsSum);
    let numValue = parseInt(requestedValue, 10) || 0;
    
    if (numValue > maxAllowed) numValue = maxAllowed;
    if (numValue < 0) numValue = 0;

    return numValue;
};
