const webSocket = require('ws');
const https = require('node:https');



function handleLogin(id, str, socket){
    const postData = `act=login&name=${encodeURIComponent(SH_USERNAME)}&pass=${encodeURIComponent(SH_PASS)}&challstr=${id}%7C${str}`;

    const options = {
        hostname: LOGIN_URL,
        path: "/api/login.php",
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-ww-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    // HACER REQUEST PARA LOGIN EN SHOWDOWN

    function initClient(messageHandler){
        const socket = new webSocket(SHOWDOWN_WS_URL);

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

}
