const fs = require('node:fs');
const path = require('node:path');

class BattleSaver {
    constructor(saveDir) {
        this.saveDir = saveDir || '../logs';
        this.ensureSaveDir();
    }

    ensureSaveDir() {
        if (!fs.existsSync(this.saveDir)) {
            fs.mkdirSync(this.saveDir, { recursive: true });
        }
    }

    saveRawLog(username, roomID, rawLog) {
        const filePath = path.join(this.saveDir, `${username.toLowerCase()}Matches.json`);
        let history = this._readFile(filePath, []);

        history.push({
            timestamp: new Date().toISOString(),
            roomID: roomID,
            log: rawLog
        });

        this._writeFile(filePath, history);
    }

    saveStats(username, analysis, winner) {
        if (!username) return;

        const filePath = path.join(this.saveDir, `${username.toLowerCase()}.json`);
        let stats = this._readFile(filePath, {
            username: username,
            totalBattles: 0,
            wins: 0,
            losses: 0,
            history: []
        });

        stats.totalBattles++;

        const cleanName = (name) => name ? name.replaceAll(/[^a-zA-Z0-9]/g, '').toLowerCase() : "";
        const isWin = (cleanName(winner) === cleanName(username));

        if (isWin) {
            stats.wins++;
        } else {
            stats.losses++;
        }

        stats.history.push({
            date: new Date().toISOString(),
            team: analysis?.myTeam || [],
            opponentTeam: analysis?.foeTeam || [],
            result: isWin ? 'WIN' : 'LOSS'
        });

        this._writeFile(filePath, stats);
    }

    updateGlobalMoveStats(username, moveCount) {
        const filePath = path.join(this.saveDir, `${username.toLowerCase()}_moves.json`);

        let globalMoves = this._readFile(filePath, {
            username: username,
            pokemon: {}
        });

        for (const pokemon in moveCount) {
            if (!globalMoves.pokemon[pokemon]) {
                globalMoves.pokemon[pokemon] = {};
            }

            for (const move in moveCount[pokemon]) {
                const currentUsage = moveCount[pokemon][move];
                globalMoves.pokemon[pokemon][move] = (globalMoves.pokemon[pokemon][move] || 0) + currentUsage;
            }
        }

        this._writeFile(filePath, globalMoves);
    }

    updateMatchups(username, foeTeam, isWin) {
        const filePath = path.join(this.saveDir, `${username.toLowerCase()}_matchups.json`);
        
        let matchups = this._readFile(filePath, {});

        foeTeam.forEach(pokemon => {
            if (!matchups[pokemon]) {
                matchups[pokemon] = {
                    wins: 0,
                    losses: 0,
                    encounters: 0,
                    winRate: 0
                };
            }

            matchups[pokemon].encounters++;
            if (isWin) {
                matchups[pokemon].wins++;
            } else {
                matchups[pokemon].losses++;
            }

            matchups[pokemon].winRate = Number.parseFloat(((matchups[pokemon].wins / matchups[pokemon].encounters) * 100).toFixed(2));
        });

        this._writeFile(filePath, matchups);
    }

    _readFile(filePath, defaultValue) {
        if (fs.existsSync(filePath)) {
            try {
                const content = fs.readFileSync(filePath, 'utf-8').trim();
                if (!content) return defaultValue;
                return JSON.parse(content);
            } catch (e) {
                console.warn(`[SAVER] Error leyendo archivo ${filePath}:`, e.message);
                return defaultValue;
            }
        }
        return defaultValue;
    }

    _writeFile(filePath, data) {
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        } catch (e) {
            console.error(`[SAVER] Error escribiendo archivo ${filePath}:`, e.message);
        }
    }
}

module.exports = { BattleSaver };