// backend/server.js
const express = require('express');
const cors = require('cors');
const teamRoutes = require('./routes/teamRoutes'); 

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/teams', teamRoutes);

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Servidor listo en http://localhost:${PORT}`);
});