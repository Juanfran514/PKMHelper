const { time } = require('node:console');
const fs = require('node:fs/promises');
const path = require('node:path');

class BattleSaver {
    constructor(saveDir) {
        this.saveDir = saveDir;
        this.ensureSaveDir();
    }

    async ensureSaveDir(){
        if(!fs.existsSync(this.saveDir)){
            fs.mkdirSync(this.saveDir, {recursive: true});
            console.log('Carpeta creada en', this.saveDir);
        }
    }

    saveBattleLog(filename, data){
        const filePath = path.join(this.saveDir, `${filename.toLowerCase()}.json`);
        let history = [];

        // LEER HISTORIAL
        if(fs.existsSync(filePath)){
            try{
                const content = fs.readFileSync(filePath, 'utf-8');
                history = JSON.parse(content);
            } catch(e){
                console.error('Error leyendo historial:', e);
                history = [];
            }
        }

        // AÑADIR COMBATE
        history.push({
            timestamp: new Date().toISOString(),
            ...data
        });

        // GUARDAR HISTORIAL
        try{
            fs.writeFileSync(filePath, JSON.stringify(history,null,2), 'utf-8');
            console.log(`Combate guardado en ${filePath}`);
        } catch (e){
            console.error('Error guardando combate:', e);
        }
    }
}

module.exports = { battleSaver };