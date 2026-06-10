const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../dbManager');

// Obtener el secreto de las variables de entorno, o usar un default para desarrollo
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_dev';
const { sendVerificationEmail } = require('../utils/mailer');

// REGISTRO
router.post('/register', async (req, res) => {
    try {
        const { username, password, email, sdName } = req.body;

        if (!username || !password || !email) {
            return res.status(400).json({ error: 'Username, password and email are required.' });
        }

        // Verificar si el usuario, email o sdName ya existe
        let query = 'SELECT id FROM "user" WHERE username = $1 OR email = $2';
        let params = [username, email];

        if (sdName) {
            query += ' OR "sdName" = $3';
            params.push(sdName);
        }

        const userExists = await pool.query(query, params);

        if (userExists.rows.length > 0) {
            return res.status(409).json({ error: 'Username, Email or Showdown Name already exists.' });
        }

        // Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insertar usuario (is_verified es FALSE por defecto en la BD)
        const result = await pool.query(
            'INSERT INTO "user" (username, password, email, "sdName", is_verified) VALUES ($1, $2, $3, $4, FALSE) RETURNING id, username, email, "sdName"',
            [username, hashedPassword, email, sdName || null]
        );

        const newUser = result.rows[0];

        // Crear token de verificación específico
        const verificationToken = jwt.sign(
            { id: newUser.id, email: newUser.email },
            JWT_SECRET,
            { expiresIn: '1d' } // Expira en 1 día
        );

        // Enviar correo de verificación
        try {
            await sendVerificationEmail(newUser.email, newUser.username, verificationToken);
        } catch (emailError) {
            console.error('Failed to send verification email but user was created:', emailError);
            // No bloqueamos el registro, pero podríamos alertar
        }

        // Ya no devolvemos el token de acceso al registrarse, bloqueando el auto-login
        res.status(201).json({
            message: 'User registered successfully. Please check your email to verify your account.',
            user: newUser
            // No token returned here
        });

    } catch (error) {
        console.error('Error in /register:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// VERIFICAR EMAIL
router.get('/verify', async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ error: 'Verification token is required.' });
        }

        // Verificar y decodificar el token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Buscar el usuario en la base de datos
        const userResult = await pool.query('SELECT id, is_verified FROM "user" WHERE id = $1', [decoded.id]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const user = userResult.rows[0];

        if (user.is_verified) {
            return res.status(400).json({ message: 'User is already verified.' });
        }

        // Actualizar el estado de verificación
        await pool.query('UPDATE "user" SET is_verified = TRUE WHERE id = $1', [decoded.id]);

        res.status(200).json({ message: 'Email verified successfully. You can now login.' });

    } catch (error) {
        console.error('Error in /verify:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ error: 'Verification link has expired.' });
        }
        res.status(500).json({ error: 'Invalid verification token or internal server error.' });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required.' });
        }

        // Buscar el usuario
        const result = await pool.query(
            'SELECT * FROM "user" WHERE username = $1 OR email = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const user = result.rows[0];

        // Verificar si el correo está verificado
        if (!user.is_verified) {
            return res.status(403).json({ error: 'Please verify your email before logging in.' });
        }

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
