// backend/server.js
const express = require('express');
const cors = require('cors');
const teamRoutes = require('./routes/teamRoutes'); 
const pokemonRoutes = require('./routes/pokemonRoutes')

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/teams', teamRoutes);
app.use('/api/stats', pokemonRoutes);

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Servidor listo en http://localhost:${PORT}`);
});