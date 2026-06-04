const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../dbManager');

// Obtener el secreto de las variables de entorno, o usar un default para desarrollo
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_dev';

// REGISTRO
router.post('/register', async (req, res) => {
    try {
        const { username, password, email, sdName } = req.body;

        if (!username || !password || !email) {
            return res.status(400).json({ error: 'Username, password and email are required.' });
        }

        // Verificar si el usuario o email ya existe
        const userExists = await pool.query(
            'SELECT id FROM "user" WHERE username = $1 OR email = $2',
            [username, email]
        );

        if (userExists.rows.length > 0) {
            return res.status(409).json({ error: 'Username or Email already exists.' });
        }

        // Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insertar usuario
        const result = await pool.query(
            'INSERT INTO "user" (username, password, email, "sdName") VALUES ($1, $2, $3, $4) RETURNING id, username, email, "sdName"',
            [username, hashedPassword, email, sdName || null]
        );

        const newUser = result.rows[0];

        // Crear token
        const token = jwt.sign(
            { id: newUser.id, username: newUser.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: newUser
        });

    } catch (error) {
        console.error('Error in /register:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required.' });
        }

        // Buscar el usuario (puede ser por username o email para mayor flexibilidad)
        const result = await pool.query(
            'SELECT * FROM "user" WHERE username = $1 OR email = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const user = result.rows[0];

        // Verificar la contraseña
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        // Actualizar lastOnline
        await pool.query(
            'UPDATE "user" SET "lastOnline" = NOW() WHERE id = $1',
            [user.id]
        );

        // Crear token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                sdName: user.sdName
            }
        });

    } catch (error) {
        console.error('Error in /login:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
