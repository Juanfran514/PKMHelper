const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const { getTeams, saveTeams } = require('../dbManager');

// GET Public Teams
router.get('/', async (req, res) => {
    try {
        const teams = await getTeams();
        
        const publicTeams = teams.filter(team => team.type === 'Public');
        
        res.json(publicTeams);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener equipos" });
    }
});

// POST team
router.post('/', async (req, res) => {
    try {
        const newTeam = new Team(req.body);
        const teams = await getTeams();
        teams.push(newTeam);
        await saveTeams(teams);
        res.status(201).json(newTeam);
    } catch (error) {
        res.status(400).json({ error: "Error al crear el equipo" });
    }
});

// GET team by id
router.get('/:id', async (req, res) => {
    try {
        const teams = await getTeams();
        const team = teams.find(t => t.id === req.params.id);
        if (!team) return res.status(404).json({ error: "No encontrado" });
        res.json(team);
    } catch (error) {
        res.status(500).json({ error: "Error de servidor" });
    }
});

// PUT
router.put('/:id', async (req, res) => {
    try {
        const teams = await getTeams();
        const index = teams.findIndex(t => t.id === req.params.id);
        if (index === -1) return res.status(404).json({ error: "No encontrado" });

        const updatedTeam = new Team({ ...req.body, id: req.params.id });
        teams[index] = updatedTeam;
        await saveTeams(teams);
        res.json(updatedTeam);
    } catch (error) {
        res.status(400).json({ error: "Error al actualizar" });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        const teams = await getTeams();
        const filtered = teams.filter(t => t.id !== req.params.id);
        await saveTeams(filtered);
        res.json({ message: "Eliminado" });
    } catch (error) {
        res.status(500).json({ error: "Error al borrar" });
    }
});

module.exports = router;