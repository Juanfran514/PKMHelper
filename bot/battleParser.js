class BattleParser {
    constructor() {
        this.TYPES = {
            PLAYER: 'player',
            SWITCH: 'switch',
            DRAG: 'drag',
            MOVE: 'move',
            WIN: 'win',
            QUERYRESPONSE: 'queryresponse',
            UPDATEUSER: 'updateuser' 
        };
    }

    parseLine(rawLine){
        if(!rawLine?.startsWith('|')) return null;

        const part = rawLine.split('|');
        const type = part[1];

        switch(type){
            case 'updateuser':
                return { 
                    type: this.TYPES.UPDATEUSER, 
                    name: part[2] 
                };

            case 'player':
                return { type: this.TYPES.PLAYER, id: part[2], name: part[3] };
            
            case 'switch':
            case 'drag':
                return {
                    type: this.TYPES.SWITCH,
                    playerID: part[2].substring(0, 2), 
                    pokemonName: part[3].split(',')[0]
                };
            
            case 'move':
                return {
                    type: this.TYPES.MOVE,
                    playerID: part[2].substring(0, 2),
                    pokemonInField: part[2].split(': ')[1] || part[2],
                    moveName: part[3]
                };
            
            case 'win': 
                return { 
                    type: this.TYPES.WIN, 
                    winner: part[2].trim() 
                };

            case 'queryresponse':
                if(part[2] === 'roomlist'){
                    return {type: this.TYPES.QUERYRESPONSE, subtype: 'roomList', data:this.safeJSON(part[3])};
                }
                return null;
            
            default: return null;
        }
    }

    getRoomID(rawMessage) {
        if (!rawMessage || typeof rawMessage !== 'string') return null;
        if (rawMessage.startsWith('>')) {
            return rawMessage.split('\n')[0].substring(1).trim();
        }
        return null;
    }

    analyzeLog(rawLog, targetUser){
        const lines = rawLog.split('\n');
        const stats = {
            myID: "",
            foeTeam: new Set(),
            myTeam: new Set(),
            moveCount: {},
            winner: null
        };

        lines.forEach(line => {
            const parsed = this.parseLine(line);
            if(!parsed) return;

            if(parsed.type === this.TYPES.PLAYER && parsed.name?.toLowerCase() === targetUser.toLowerCase()){
                stats.myID = parsed.id;
            }

            if(parsed.type === this.TYPES.WIN) {
                stats.winner = parsed.winner;
            }
        });

        // Segunda pasada: Analizar equipo y movimientos
        lines.forEach(line => {
            const data = this.parseLine(line);
            if(!data) return;

            switch (data.type) {
                case this.TYPES.SWITCH:
                    if (data.playerID === stats.myID) {
                        stats.myTeam.add(data.pokemonName);
                    } else {
                        stats.foeTeam.add(data.pokemonName);
                    }
                    break;
                case this.TYPES.MOVE:
                    if (data.playerID === stats.myID) {
                        const poke = data.pokemonInField;
                        const move = data.moveName;
                        if (!stats.moveCount[poke]) stats.moveCount[poke] = {};
                        stats.moveCount[poke][move] = (stats.moveCount[poke][move] || 0) + 1;
                    }
                    break;
            }
        });

        return {
            myTeam: Array.from(stats.myTeam),
            foeTeam: Array.from(stats.foeTeam),
            moveCount: stats.moveCount,
            winner: stats.winner 
        }
    }

    safeJSON(str){
        try { return JSON.parse(str); } 
        catch(e){ 
            console.error(`[PARSER] Error al analizar JSON: ${e.message}`);
            return null;
        }
    }
}

module.exports = BattleParser;