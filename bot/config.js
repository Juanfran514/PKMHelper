require('dotenv').config();
const path = require('node:path');

module.exports = {
    // User y Password Bot
    SH_USER: process.env.SH_USER || 'TuUsuarioBot',
    SH_PASS: process.env.SH_PASS || 'TuPassword',
    
    // URLs
    SHOWDOWN_WS_URL: 'wss://sim3.psim.us/showdown/websocket',
    LOGIN_URL: 'play.pokemonshowdown.com',

    // Ruta logs
    LOGS_DIR: process.env.LOGS_DIR || path.join(__dirname, '..', 'logs'),

    // Coonfig Scanner
    SCAN_INTERVAL: Number.parseInt(process.env.SCAN_INTERVAL) || 5000,

};