const fs = require('node:fs');
const path = require('node:path');

class BattleSaver {
    constructor(saveDir) {
        this.saveDir = saveDir;
        this.ensureSaveDir();
    }

    ensureSaveDir() {
        if (!fs.existsSync(this.saveDir)) {
            fs.mkdirSync(this.saveDir, { recursive: true });
        }
    }

    saveBattleLog(filename, data) {
        const filePath = path.join(this.saveDir, `${filename.toLowerCase()}.json`);
        let history = [];

        if (fs.existsSync(filePath)) {
            try {
                const content = fs.readFileSync(filePath, 'utf-8');
                history = JSON.parse(content);
            } catch (e) {
                console.error('No se puede leer, se reescribirá:', e.message);
                history = [];
            }
        }

        // Añadimos la fecha y los datos
        history.push({
            timestamp: new Date().toISOString(),
            ...data
        });

        try {
            fs.writeFileSync(filePath, JSON.stringify(history, null, 2), 'utf-8');
            console.log(`Datos guardados en: ${filePath}`);
        } catch (e) {
            console.error('No se pudo guardar el archivo:', e.message);
        }
    }
}

module.exports = { BattleSaver };