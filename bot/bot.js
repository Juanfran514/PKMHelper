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

// Sincronizar objetivos con la base de datos
async function syncTargetUsers() {
    const users = await storage.getRegisteredUsers();
    const newTargets = users.map(u => u.trim().toLowerCase()).filter(Boolean);
    
    const added = newTargets.filter(u => !tracker.targetUsers.includes(u));
    const removed = tracker.targetUsers.filter(u => !newTargets.includes(u));
    
    if (added.length > 0 || removed.length > 0) {
        tracker.targetUsers = newTargets;
        console.log(`\n[TRACKER] Lista de objetivos actualizada desde la BD. Total: ${newTargets.length} usuarios.`);
        console.log(`[TRACKER] Rastreando a: ${newTargets.join(', ') || 'Nadie'}`);
    } else if (tracker.targetUsers.length === 0) {
        tracker.targetUsers = newTargets; // Para evitar array vacío inicial si no hay
        console.log(`\n[TRACKER] Conectado a la BD. Rastreando a: ${newTargets.join(', ') || 'Nadie'}`);
    }
}

// Ejecutar al iniciar
syncTargetUsers();

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
            
            if (config.SH_USER && currentBotUser.toLowerCase().includes(config.SH_USER.toLowerCase())) {
                console.log(`\nBot logeado: ${currentBotUser}`);
                if (!globalThis.scannerStarted) {
                    const scanner = new Scanner(ws, config.SCAN_INTERVAL, syncTargetUsers);
                    scanner.start();
                    globalThis.scannerStarted = true;
                    console.log(`[SCANNER] Radar activado (Intervalo: ${config.SCAN_INTERVAL}ms)`);
                }
            }
            break; }

       case 'queryresponse':
            if (parsed.subtype === 'roomList') {
                const rooms = parsed.data?.rooms || {};
                
                // Obtenemos qué objetivos se han encontrado en esta pasada
                const foundTargets = tracker.checkRoomList(rooms, ws);
                
                if (tracker.targetUsers.length > 0) {
                    console.log(`\n[SCANNER] Rastreo completado. Buscando a: ${tracker.targetUsers.join(', ')}`);
                    if (foundTargets.length > 0) {
                        console.log(`[SCANNER] ✅ Encontrados en combate: ${foundTargets.join(', ')}`);
                    } else {
                        console.log(`[SCANNER] ❌ Ninguno de los objetivos está jugando en este momento.`);
                    }
                } else {
                    console.log(`\n[SCANNER] Esperando objetivos en la base de datos...`);
                }
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