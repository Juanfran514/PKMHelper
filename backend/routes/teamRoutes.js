// backend/routes/teamRoutes.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Ruta donde se guardará nuestro JSON (en la carpeta raíz del backend)
const teamsFilePath = path.join(__dirname, '../teams.json');

// GET: Enviar los equipos guardados al Frontend
router.get('/', (req, res) => {
    try {
        if (!fs.existsSync(teamsFilePath)) {
            return res.json([]); 
        }
        const data = fs.readFileSync(teamsFilePath, 'utf8');
        let teams = JSON.parse(data);

        // NUEVO: Miramos si el Frontend pide los equipos de alguien en concreto
        const { trainerName } = req.query; 
        
        if (trainerName) {
            // Filtramos y nos quedamos solo con los que coincidan
            teams = teams.filter(team => team.trainerName === trainerName);
        }

        res.json(teams);
    } catch (error) {
        console.error("❌ Error leyendo teams.json:", error);
        res.status(500).json({ error: "Error leyendo equipos" });
    }
});

// POST: Recibir un equipo y guardarlo
router.post('/', (req, res) => {
    try {
        const newTeam = req.body;
        console.log("📥 Recibiendo equipo para guardar:", newTeam.teamName);

        // Le generamos un ID único si no lo tiene
        if (!newTeam.id) {
            newTeam.id = Date.now().toString();
        }

        let teams = [];
        // Si el archivo ya existe, sacamos los equipos que ya hubiera
        if (fs.existsSync(teamsFilePath)) {
            const data = fs.readFileSync(teamsFilePath, 'utf8');
            teams = JSON.parse(data);
        }

        // Comprobamos si el equipo ya existe (por ID o por Nombre) para actualizarlo o añadirlo
        const existingIndex = teams.findIndex(t => t.id === newTeam.id || t.teamName === newTeam.teamName);
        
        if (existingIndex >= 0) {
            teams[existingIndex] = newTeam; // Lo actualizamos
            console.log("🔄 Equipo actualizado en la base de datos.");
        } else {
            teams.push(newTeam); // Lo añadimos nuevo
            console.log("✅ Nuevo equipo añadido a la base de datos.");
        }

        // Guardamos todo de vuelta en el archivo JSON
        fs.writeFileSync(teamsFilePath, JSON.stringify(teams, null, 2));
        
        // Le avisamos al Frontend de que todo ha ido bien
        res.status(200).json({ message: 'Equipo guardado correctamente', team: newTeam });
        
    } catch (error) {
        console.error("❌ Error CRÍTICO al intentar guardar el equipo:", error);
        res.status(500).json({ error: "Error interno al guardar el equipo" });
    }
});

module.exports = router;