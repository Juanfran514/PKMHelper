const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../dbManager');
const { sendVerificationEmail } = require('../utils/email');

// Obtener el secreto de las variables de entorno, o usar un default para desarrollo
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_dev';

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

        // Insertar usuario
        const result = await pool.query(
            'INSERT INTO "user" (username, password, email, "sdName", is_verified) VALUES ($1, $2, $3, $4, FALSE) RETURNING id, username, email, "sdName", is_verified',
            [username, hashedPassword, email, sdName || null]
        );

        const newUser = result.rows[0];

        // Crear token de verificación (expira en 1 hora)
        const verificationToken = jwt.sign(
            { id: newUser.id, email: newUser.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Enviar email
        try {
            await sendVerificationEmail(newUser.email, verificationToken);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            // Even if email fails, user is registered, but they will need to request a new email
        }

        res.status(201).json({
            message: 'User registered successfully. Please check your email to verify your account.',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            }
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

        // Check if verified
        if (!user.is_verified) {
            return res.status(403).json({ error: 'Please verify your email before logging in.', unverified: true });
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

// VERIFICAR EMAIL
router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Actualizar is_verified
        const result = await pool.query(
            'UPDATE "user" SET is_verified = TRUE WHERE id = $1 RETURNING id',
            [decoded.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'Email verified successfully' });

    } catch (error) {
        console.error('Error verifying email:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ error: 'Verification link expired. Please request a new one.' });
        }
        res.status(400).json({ error: 'Invalid verification link' });
    }
});

// REENVIAR EMAIL DE VERIFICACIÓN
router.post('/resend-verification', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }

        // Buscar al usuario
        const result = await pool.query(
            'SELECT id, email, is_verified FROM "user" WHERE username = $1 OR email = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];

        if (user.is_verified) {
            return res.status(400).json({ error: 'User is already verified' });
        }

        // Crear token de verificación
        const verificationToken = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        await sendVerificationEmail(user.email, verificationToken);

        res.json({ message: 'Verification email resent successfully' });

    } catch (error) {
        console.error('Error resending verification email:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
