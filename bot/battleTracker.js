class BattleTracker {
    constructor(parser, storage) {
        this.parser = parser;
        this.storage = storage;
        this.targetUsers = []; 
        this.activeBattles = {}; 
        this.visitedRooms = new Set();
    }

    setTargetUser(user) {
        const cleanUser = user.toLowerCase().trim();
        if (!this.targetUsers.includes(cleanUser)) {
            this.targetUsers.push(cleanUser);
            console.log(`Usuario añadido: ${cleanUser}`);
        }
    }

    // BUSCAR EN ROOMLIST
    checkRoomList(rooms, socket) {
        for (const roomID in rooms) {
            const roomData = rooms[roomID];
            if (!roomData.p1 || !roomData.p2) continue;

            const p1 = roomData.p1.toLowerCase();
            const p2 = roomData.p2.toLowerCase();

            const foundTarget = this.targetUsers.find(user => p1 === user || p2 === user);

            if (foundTarget && !this.visitedRooms.has(roomID) && !this.activeBattles[roomID]) {
                console.log(`\n${foundTarget} jugando en: ${roomID}`);
                
                this.visitedRooms.add(roomID);
                this.activeBattles[roomID] = { 
                    log: "", 
                    target: foundTarget 
                }; 
                
                socket.send(`|/join ${roomID}`);
            }
        }
    }

    trackLine(roomID, rawMessage) {
        const battle = this.activeBattles[roomID];
        if (!battle) return false;

        battle.log += rawMessage + "\n";

        if (rawMessage.includes('|win|') || rawMessage.includes('|forfeited')) {
            return true; 
        }
        return false;
    }

    completeBattle(roomID, socket) {
        const battle = this.activeBattles[roomID];
        if (!battle) return;

        console.log(`Batalla ${roomID} terminada.`);

        const stats = this.parser.analyzeLog(battle.log, battle.target);

        this.storage.saveBattleLog(battle.target, {
            roomID: roomID,
            stats: stats
        });

        delete this.activeBattles[roomID];
        socket.send(`|/leave ${roomID}`);
    }
}

module.exports = BattleTracker;