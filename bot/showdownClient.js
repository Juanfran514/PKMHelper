const webSocket = require('ws');
const https = require('node:https');
const config = require('./config');



function handleLogin(id, str, socket){
    const postData = `act=login&name=${encodeURIComponent(config.SH_USER)}&pass=${encodeURIComponent(config.SH_PASS)}&challstr=${id}%7C${str}`;

    const options = {
        hostname: config.LOGIN_URL,
        path: config.LOGIN_PATH, //SHOWDOWN ORIGINAL "/api/login.php"
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-ww-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

// REQUEST LOGIN SHOWDOWN BOT
    const req = https.request(options,(res) => {
        let body = '';
        res.on('data', (d) => body += d);
        res.on('end', () => {
            try{
                if (body.startsWith(']')) body = body.substring(1);
                const result = JSON.parse(body);
                socket.send(`|/trn ${config.SH_USER},0,${result.assertion}`);
            } catch (e) {
                console.error('Error en req login:', e.message);
            }
        });
    });

    req.on('error', (e) => console.error('Error en petición:', e.message));
    req.write(postData);
    req.end();
}


// CONEXIÓN WEBSOCKET
function initClient(messageHandler){
    const socket = new webSocket(config.SHOWDOWN_WS_URL);

    socket.on('open', () => {
        console.log('Conectado a Showdown');
    });

    socket.on('message', (data) => {
        const message = data.toString();
        const parts = message.split('|');

        if(parts[1] === 'challstr'){
            handleLogin(parts[2], parts[3], socket);
        }

        messageHandler(socket, message);
    });

    socket.on('error', (error) => console.error('Error sowdownClient.js:', error));

    return socket;
}


module.exports = {initClient};
