// backend/routes/teamRoutes.js
const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

// GET: Enviar los equipos guardados al Frontend
router.get('/', teamController.getAllTeams);

// GET: Obtener estadísticas de arquetipos de equipos públicos
router.get('/meta/archetypes', teamController.getMetaArchetypes);

// GET: Enviar equipos meta (públicos)
router.get('/meta', teamController.getMetaTeams);

// POST: Recibir un equipo y guardarlo
router.post('/', teamController.saveTeam);

// GET: Obtener un equipo específico por su ID
router.get('/single/:id', teamController.getSingleTeam);

// GET: Obtener analíticas de rendimiento de un equipo o grupo de equipos
router.get('/:id/analytics', teamController.getTeamAnalytics);

// DELETE: Eliminar un equipo por su team_group_id
router.delete('/:id', teamController.deleteTeam);

module.exports = router;