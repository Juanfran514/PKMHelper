class BattleTracker {
    constructor(Parser, Saver){
        this.Parser = Parser;
        this.Saver = Saver;

        this.targetUser = null;
        this.activeBattles = {};
        this.visitedRooms = new Set();
    }

    setTargetUser(username){
        this.targetUser = username.toLowerCase();
        this.visitedRooms.clear();
        console.log(`Usuario a buscar:${this.targetUser}`);
    }

    checkRoomList(rooms){
        if(!this.targeUser) return;

        for(const roomID in rooms){
            const p1 = rooms[roomID].p1?.toLowerCase();
            const p2 = rooms[roomID].p2?.toLowerCase();
                                                                // REVISAR QUE PASA SI DOS REGISTRADOS ESTAN EN UN COMBATE
            if(p1 === this.targetUser || p2 === this.targetUser && !this.visitedRooms.has(roomID)){ 
                this.visitedRooms.add(roomID);
                this.activeBattles[roomID] = {
                    log:[],
                    target: this.targetUser
                };

                socket.send(`|/join ${roomID}`);
                console.log(`Entrando a sala ${roomID}`);
            }
        }
    }

    trackLine(roomID, lines){
        if(this.activeBattles[roomID]){
            this.activeBattles[roomID].log.push(...lines);
            
            const hasEnd = lines.some(line => line.includes('|win|') || line.includes('|tie'));
            return hasEnd;
        }
        return false;
    }

    completeBattle(roomID, socket) {
        const battle = this.activeBattles[roomID];
        if (!battle) return;

        console.log(`Batalla Terminada en ${roomID}`);

        // Parse analiza el log
        const rawLogText = battle.log.join('\n');
        const stats = this.parser.analyzeLog(rawLogText, battle.target);

        // Guarda JSON
        this.storage.saveBattleLog(battle.target, stats);

        // Salimos de sala
        delete this.activeBattles[roomID];
        socket.send(`|/leave ${roomID}`);
    }
}

module.exports = BattleTracker;