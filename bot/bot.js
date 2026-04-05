const config = require('./config');
const { initClient } = require('./showdownClient');
const BattleParser = require('./battleParser');
const { BattleSaver } = require('./battleSaver');
const BattleTracker = require('./battleTracker');
const Scanner = require('./battleScanner');
const readline = require('node:readline');


const parser = new BattleParser();
const storage = new BattleSaver(config.LOGS_DIR);
const tracker = new BattleTracker(parser, storage);

// Usuarios Terminal
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


rl.on('line', (input) => {
    const user = input.trim();
    if (user) {
        tracker.setTargetUser(user);
    }
});

// Socket
const socket = initClient((ws, rawMessage) => {
    
    const roomID = parser.getRoomID(rawMessage);
    
    if (roomID && tracker.activeBattles[roomID]) {
        const isFinished = tracker.trackLine(roomID, rawMessage);
        
        if (isFinished) {
            console.log(`\nCombate acabado : ${roomID}`);
            tracker.completeBattle(roomID, ws);
        }
        return; 
    }

    const parsed = parser.parseLine(rawMessage);
    if (!parsed) return;

    switch (parsed.type) {
        case 'updateuser':
            { const currentBotUser = parsed.name || parsed.user || "";
            
            if (currentBotUser.toLowerCase().includes(config.SH_USER.toLowerCase())) {
                console.log(`\nBot logeado: ${currentBotUser}`);
                if (!globalThis.scannerStarted) {
                    const scanner = new Scanner(ws, config.SCAN_INTERVAL);
                    scanner.start();
                    globalThis.scannerStarted = true;
                    console.log(`[SCANNER] Radar activado (Intervalo: ${config.SCAN_INTERVAL}ms)`);
                }
            }
            break; }

       case 'queryresponse':
            if (parsed.subtype === 'roomList') {
                const rooms = parsed.data?.rooms || {};
                
                if (tracker.targetUsers.length > 0) {
                    process.stdout.write(`\rObjetivos: [${tracker.targetUsers.join(', ')}]   `);
                } else {
                    process.stdout.write(`\rEsperando objetivos...`);
                }

                tracker.checkRoomList(rooms, ws);
            }
            break;

        case 'win':
            console.log(`\nVictoria en sala: ${parsed.winner}`);
            break;
    }
});

process.on('uncaughtException', (err) => {
    console.error('\n[FATAL] Error en bot.js:', err.message);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('\nPromesa no controlada:', reason);
});