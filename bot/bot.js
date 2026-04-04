/*

    CAMBIAR PARA GUARDAR EN BD
    CAMBIAR PARA BSUCAR REGISTRADOS
    POR AHORA SOLO GUARDA EN JSONS POR USUARIO

*/ 


const config = require('./config');
const { initClient } = require('./showdownClient');
const BattleParser = require('./battleParser');
const { battleSaver } = require('./battleSaver');
const BattleTracker = require('./battleTracker');
const Scanner = require('./Scanner');
const readline = require('node:readline');


const parser = new BattleParser();
const storage = new battleSaver(config.LOGS_DIR);

const tracker = new BattleTracker(parser, storage);

// DATOS POR TERMINAL 
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on('line', (input) => {
    const user = input.trim();
    if (user) {
        tracker.setTarget(user);
    }
});

// Entra a showdown
const socket = initClient((ws, rawMessage) => {
    
    const roomID = parser.getRoomID(rawMessage);
    
    if (roomID && tracker.activeBattles[roomID]) {
        const lines = rawMessage.split('\n').slice(1);
        const isFinished = tracker.trackLine(roomID, lines);
        
        if (isFinished) {
            tracker.completeBattle(roomID, ws);
        }
        return; 
    }

    // Mensajes 
    const parsed = parser.parseLine(rawMessage);
    if (!parsed) return;

    switch (parsed.type) {
        case 'updateuser':
            if (parsed.user.includes(config.SH_USER)) {
                console.log(`\nBot online como ${parsed.user}`);
                console.log('Usuario a tracker: ');

                const scanner = new Scanner(ws, config.SCAN_INTERVAL);
                scanner.start();
            }
            break;

        case 'queryresponse':
            if (parsed.subtype === 'roomList') {
                tracker.processRoomList(parsed.data.rooms, ws);
            }
            break;
    }
});

process.on('uncaughtException', (err) => {
    console.error('[FATAL] Error no controlado:', err);
});