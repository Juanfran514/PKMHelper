require('dotenv').config();
const path = require('node:path');

module.exports = {
    // User y Password Bot
    SH_USER: process.env.SH_USER,
    SH_PASS: process.env.SH_PASS,

    // URLs
    SHOWDOWN_WS_URL: 'wss://sim3.psim.us/showdown/websocket',  //SHOWDOWN SERVER 'wss://showdown.vgcpast.es/showdown/websocket'
    LOGIN_URL: 'play.pokemonshowdown.com',  //SHOWDOWN SERVER 'play.pokemonshowdown.com'
    LOGIN_PATH: '/api/login.php', //SHOWDOWN SERVER "/~~showdown-vgcpast-es/action.php"

    // Ruta logs
    LOGS_DIR: process.env.LOGS_DIR,

    // Config Scanner
    SCAN_INTERVAL: 5000,

};