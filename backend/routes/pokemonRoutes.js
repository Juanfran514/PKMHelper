const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// GET Stats by Pokemon Name
router.get('/:pokemonName', (req, res) => {
    try {
        const filePath = path.join(__dirname, '../data/competitive_sets.json');
        
        if (!fs.existsSync(filePath)) {
            return res.status(500).json({ error: "Base de datos de stats no encontrada en el servidor" });
        }

        const rawData = fs.readFileSync(filePath);
        const statsData = JSON.parse(rawData);

        const requestedName = req.params.pokemonName;

        const normalize = (name) => name.toLowerCase().replace(/[- ]/g, '');

        const normalizedRequest = normalize(requestedName);

        // 4. Buscamos en el Array de tus datos scrapeados
        const pokemonStats = statsData.find(p => normalize(p.name) === normalizedRequest);

        if (!pokemonStats) {
            return res.status(404).json({ error: "No hay stats para " + requestedName });
        }

        // 5. Si lo encuentra, se lo enviamos a React
        res.json(pokemonStats);

    } catch (error) {
        console.error("Error leyendo las stats:", error);
        res.status(500).json({ error: "Error de servidor al leer stats" });
    }
});

module.exports = router;