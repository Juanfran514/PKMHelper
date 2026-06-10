const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../dbManager');
const { Resend } = require('resend');

// Obtener el secreto de las variables de entorno, o usar un default para desarrollo
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_dev';
const resend = new Resend(process.env.RESEND_API_KEY);

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
            'INSERT INTO "user" (username, password, email, "sdName", is_verified) VALUES ($1, $2, $3, $4, false) RETURNING id, username, email, "sdName"',
            [username, hashedPassword, email, sdName || null]
        );

        const newUser = result.rows[0];

        // Crear token de verificacion
        const verificationToken = jwt.sign(
            { id: newUser.id, action: 'verify_email' },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost';
        const verifyLink = `${frontendUrl}/verify-email?token=${verificationToken}`;

        try {
            await resend.emails.send({
                from: 'Acme <onboarding@resend.dev>', // Cambiar a tu dominio verificado cuando sea posible
                to: email,
                subject: 'Verify your email address',
                html: `<p>Please click the link below to verify your email address:</p><p><a href="${verifyLink}">${verifyLink}</a></p>`
            });
        } catch (emailError) {
            console.error('Error sending verification email:', emailError);
        }

        res.status(201).json({
            message: 'User registered successfully. Please check your email to verify your account.',
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

        if (!user.is_verified) {
            return res.status(403).json({ error: 'Please verify your email first.' });
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

// VERIFY EMAIL
router.get('/verify-email', async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ error: 'Token is required' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.action !== 'verify_email') {
            return res.status(400).json({ error: 'Invalid token' });
        }

        await pool.query(
            'UPDATE "user" SET is_verified = true WHERE id = $1',
            [decoded.id]
        );

        res.status(200).json({ message: 'Email verified successfully' });

    } catch (error) {
        console.error('Error in /verify-email:', error);
        res.status(400).json({ error: 'Invalid or expired token.' });
    }
});

module.exports = router;
