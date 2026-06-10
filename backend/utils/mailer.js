const Mailjet = require('node-mailjet');

// Configuración de Mailjet
const mailjet = Mailjet.apiConnect(
    process.env.MAILJET_API_KEY,
    process.env.MAILJET_API_SECRET
);

const SENDER_EMAIL = process.env.MAILJET_SENDER_EMAIL || 'tucorreo@ejemplo.com';

const sendVerificationEmail = async (toEmail, username, verificationToken) => {
    // Usamos la URL base del frontend para el enlace de verificación
    const FRONTEND_URL = process.env.FRONTEND_URL || 'https://pkmhelper.up.railway.app';
    const verificationLink = `${FRONTEND_URL}/verify?token=${verificationToken}`;

    const request = mailjet
        .post('send', { version: 'v3.1' })
        .request({
            Messages: [
                {
                    From: {
                        Email: SENDER_EMAIL,
                        Name: "PKMHelper",
                    },
                    To: [
                        {
                            Email: toEmail,
                            Name: username,
                        },
                    ],
                    Subject: "Verifica tu cuenta en PKMHelper",
                    TextPart: `Hola ${username},\n\nPor favor, verifica tu cuenta de PKMHelper haciendo clic en el siguiente enlace:\n${verificationLink}\n\nSi no creaste esta cuenta, puedes ignorar este correo.`,
                    HTMLPart: `<h3>Hola ${username},</h3>
                    <p>Por favor, verifica tu cuenta de PKMHelper haciendo clic en el siguiente enlace:</p>
                    <a href="${verificationLink}">Verificar mi cuenta</a>
                    <br/><br/>
                    <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                    <p>${verificationLink}</p>
                    <br/>
                    <p>Si no creaste esta cuenta, puedes ignorar este correo.</p>`,
                },
            ],
        });

    try {
        const result = await request;
        console.log(`Verification email sent to ${toEmail}`);
        return result.body;
    } catch (err) {
        console.error('Error sending verification email:', err.statusCode, err.message);
        throw err;
    }
};

const sendPasswordResetEmail = async (toEmail, username, resetToken) => {
    const FRONTEND_URL = process.env.FRONTEND_URL || 'https://pkmhelper.up.railway.app';
    const resetLink = `${FRONTEND_URL}/reset-password?token=${resetToken}`;

    const request = mailjet
        .post('send', { version: 'v3.1' })
        .request({
            Messages: [
                {
                    From: {
                        Email: SENDER_EMAIL,
                        Name: "PKMHelper",
                    },
                    To: [
                        {
                            Email: toEmail,
                            Name: username,
                        },
                    ],
                    Subject: "Recuperación de contraseña en PKMHelper",
                    TextPart: `Hola ${username},\n\nHemos recibido una solicitud para restablecer tu contraseña.\n\nHaz clic en el siguiente enlace para crear una nueva contraseña:\n${resetLink}\n\nSi no fuiste tú quien solicitó esto, ignora este correo.`,
                    HTMLPart: `<h3>Hola ${username},</h3>
                    <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
                    <a href="${resetLink}">Restablecer contraseña</a>
                    <br/><br/>
                    <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                    <p>${resetLink}</p>
                    <br/>
                    <p>Si no fuiste tú quien solicitó esto, ignora este correo. Tu contraseña no cambiará hasta que accedas al enlace y crees una nueva.</p>`,
                },
            ],
        });

    try {
        const result = await request;
        console.log(`Password reset email sent to ${toEmail}`);
        return result.body;
    } catch (err) {
        console.error('Error sending password reset email:', err.statusCode, err.message);
        throw err;
    }
};

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail,
};
