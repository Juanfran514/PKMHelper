// SRP: Utilitarios de parseo separados
const parsePokemonId = (idString) => {
    const player = idString.substring(0, 2);
    const slot = idString.substring(0, 3);
    const name = idString.split(': ')[1]?.trim() || idString;
    return { player, slot, name };
};

const parseHP = (hpString) => {
    if (!hpString) return { current: 0, max: 100, status: '', fainted: false };
    if (hpString.includes('fnt')) return { current: 0, max: 100, status: '', fainted: true };

    const parts = hpString.split(' ');
    const hpFraction = parts[0];
    const status = parts[1] || '';

    const [current, max] = hpFraction.split('/').map(Number);
    const maxHp = max || 100;
    const currentHp = isNaN(current) ? 0 : current;

    return { current: currentHp, max: maxHp, status, fainted: currentHp === 0 };
};

// DRY: Handlers comunes
const handleSwitch = (ctx, parts) => {
    const sw = parsePokemonId(parts[2]);
    const swBaseName = parts[3].split(', ')[0];
    const swHp = parseHP(parts[4]);

    if (!ctx.state[sw.player].team[swBaseName]) {
        ctx.state[sw.player].team[swBaseName] = { name: swBaseName };
    }
    ctx.state[sw.player].team[swBaseName].hp = swHp;
    ctx.state[sw.player].team[swBaseName].active = true;
    
    const activeIndex = ctx.state[sw.player].active.findIndex(a => a.slot === sw.slot);
    if (activeIndex !== -1) {
        ctx.state[sw.player].active[activeIndex] = { slot: sw.slot, name: swBaseName };
    } else {
        ctx.state[sw.player].active.push({ slot: sw.slot, name: swBaseName });
    }

    ctx.currentTurn.events.push(`Cambio: ${sw.player === 'p1' ? ctx.state.p1.name : ctx.state.p2.name} envía a ${swBaseName}`);
};

const handleDamageHeal = (ctx, parts, action) => {
    const dmgTarget = parsePokemonId(parts[2]);
    const dmgHp = parseHP(parts[3]);

    const activePkmn = ctx.state[dmgTarget.player].active.find(a => a.slot === dmgTarget.slot);
    if (activePkmn && ctx.state[dmgTarget.player].team[activePkmn.name]) {
        ctx.state[dmgTarget.player].team[activePkmn.name].hp = dmgHp;
    }

    const verb = action === '-damage' ? 'recibe daño' : 'se cura';
    ctx.currentTurn.events.push(`${dmgTarget.name} ${verb} (${dmgHp.current}/${dmgHp.max})`);
};

// OCP: Mapa de Estrategias (Action Handlers) en lugar de un switch gigante
const actionHandlers = {
    'player': (ctx, parts) => {
        if (parts[2] === 'p1') ctx.state.p1.name = parts[3];
        if (parts[2] === 'p2') ctx.state.p2.name = parts[3];
    },
    'poke': (ctx, parts) => {
        const p = parts[2];
        const pkmnName = parts[3].split(', ')[0];
        ctx.state[p].team[pkmnName] = {
            name: pkmnName,
            hp: { current: 100, max: 100, status: '', fainted: false },
            active: false
        };
    },
    'switch': handleSwitch,
    'drag': handleSwitch,
    'turn': (ctx, parts) => {
        ctx.currentTurn.stateSnapshot = JSON.parse(JSON.stringify(ctx.state));
        ctx.turns.push(ctx.currentTurn);
        ctx.currentTurn = { turnNumber: parseInt(parts[2], 10), events: [], stateSnapshot: null };
    },
    'move': (ctx, parts) => {
        const moveUser = parsePokemonId(parts[2]);
        ctx.currentTurn.events.push(`${moveUser.name} usa ${parts[3]}!`);
    },
    '-damage': (ctx, parts) => handleDamageHeal(ctx, parts, '-damage'),
    '-heal': (ctx, parts) => handleDamageHeal(ctx, parts, '-heal'),
    'faint': (ctx, parts) => {
        const faintTarget = parsePokemonId(parts[2]);
        const fActive = ctx.state[faintTarget.player].active.find(a => a.slot === faintTarget.slot);
        if (fActive && ctx.state[faintTarget.player].team[fActive.name]) {
            ctx.state[faintTarget.player].team[fActive.name].hp.fainted = true;
            ctx.state[faintTarget.player].team[fActive.name].hp.current = 0;
        }
        ctx.currentTurn.events.push(`${faintTarget.name} se ha debilitado!`);
    },
    'cant': (ctx, parts) => {
        const cantTarget = parsePokemonId(parts[2]);
        ctx.currentTurn.events.push(`${cantTarget.name} no puede atacar (${parts[3]})!`);
    },
    '-mega': (ctx, parts) => {
        const megaTarget = parsePokemonId(parts[2]);
        ctx.currentTurn.events.push(`${megaTarget.name} megaevoluciona a Mega ${parts[3]}!`);
    },
    '-weather': (ctx, parts) => {
        const weather = parts[2];
        if (weather !== 'none') ctx.currentTurn.events.push(`El clima cambió a ${weather}.`);
    },
    'win': (ctx, parts) => {
        ctx.currentTurn.events.push(`¡${parts[2]} ha ganado la partida!`);
    }
};

export function parseShowdownLog(logText) {
    if (!logText) return null;

    const ctx = {
        state: {
            p1: { name: 'Player 1', team: {}, active: [] },
            p2: { name: 'Player 2', team: {}, active: [] },
        },
        turns: [],
        currentTurn: { turnNumber: 0, events: [], stateSnapshot: null }
    };

    const lines = logText.split('\n');

    for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith('>')) continue;

        const parts = line.split('|');
        if (parts.length < 2) continue;

        const action = parts[1];
        
        // Delegar la lógica al handler correspondiente
        if (actionHandlers[action]) {
            actionHandlers[action](ctx, parts);
        }
    }

    // Push the final state (the end of the last turn or the whole battle)
    ctx.currentTurn.stateSnapshot = JSON.parse(JSON.stringify(ctx.state));
    ctx.turns.push(ctx.currentTurn);

    return {
        p1: ctx.state.p1.name,
        p2: ctx.state.p2.name,
        turns: ctx.turns
    };
}
