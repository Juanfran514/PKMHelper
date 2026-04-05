class BattleTracker {
    constructor(parser, storage) {
        this.parser = parser;
        this.storage = storage;
        this.targetUsers = [];
        this.activeBattles = {}; 
    }

    setTargetUser(user) {
        const username = user.toLowerCase();
        if (!this.targetUsers.includes(username)) {
            this.targetUsers.push(username);
            console.log(`[TRACKER] Objetivo añadido: ${username}`);
        }
    }

    checkRoomList(rooms, socket) {
        for (const roomID in rooms) {
            const roomData = rooms[roomID];
            const p1 = roomData.p1?.toLowerCase();
            const p2 = roomData.p2?.toLowerCase();

            const target = this.targetUsers.find(u => u === p1 || u === p2);

            if (target && !this.activeBattles[roomID]) {
                console.log(`[TRACKER] Detectado objetivo ${target} en ${roomID}. Entrando...`);
                
                this.activeBattles[roomID] = {
                    target: target,
                    log: []
                };

                socket.send(`|/join ${roomID}`);
            }
        }
    }

    trackLine(roomID, rawMessage) {
        if (this.activeBattles[roomID]) {
            this.activeBattles[roomID].log.push(rawMessage);
            
            return rawMessage.includes('|win|');
        }
        return false;
    }

    completeBattle(roomID, socket) {
        const battle = this.activeBattles[roomID];
        if (!battle) return;

        try {
            const fullLogString = battle.log.join('\n');
            const stats = this.parser.analyzeLog(fullLogString, battle.target);

            if (stats) {
                const cleanName = (n) => n ? n.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() : "";
                const isWin = cleanName(stats.winner) === cleanName(battle.target);

                // 2. Guardar Logs Raw
                this.storage.saveRawLog(battle.target, roomID, fullLogString);
                
                this.storage.saveStats(battle.target, stats, stats.winner);

                this.storage.updateGlobalMoveStats(battle.target, stats.moveCount);

                if (stats.foeTeam && stats.foeTeam.length > 0) {
                    this.storage.updateMatchups(battle.target, stats.foeTeam, isWin);
                }

                console.log(`[ANALYSIS] Partida finalizada en ${roomID}. Datos actualizados para ${battle.target}.`);
            }
        } catch (err) {
            console.error(`[ERROR] Error procesando estadísticas:`, err);
        }

        delete this.activeBattles[roomID];
        socket.send(`|/leave ${roomID}`);
    }
}

module.exports = BattleTracker;