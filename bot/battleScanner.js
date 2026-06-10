class BattleScanner {
    constructor(socket, interval = 5000, preScanCallback = null) {
        this.socket = socket;
        this.interval = interval;
        this.timer = null;
        this.isActive = false;
        this.preScanCallback = preScanCallback;
    }

    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        console.log(`Buscando combates`);
        
        this.timer = setInterval(() => {
            this.scan();
        }, this.interval);
        
        this.scan();
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
            this.isActive = false;
            console.log('Escaner parado');
        }
    }

    // Escanea roomlist
    async scan() {
        if (this.preScanCallback) {
            try {
                await this.preScanCallback();
            } catch (err) {
                console.error('[SCANNER] Error actualizando objetivos:', err);
            }
        }
        if (this.socket?.readyState === 1) { 
            this.socket.send('|/cmd roomlist');
        }
    }
}

module.exports = BattleScanner;