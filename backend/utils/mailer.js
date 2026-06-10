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

module.exports = {
    sendVerificationEmail,
};
