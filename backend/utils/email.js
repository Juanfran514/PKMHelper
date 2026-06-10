const nodemailer = require('nodemailer');
const dns = require('dns').promises;

const sendVerificationEmail = async (to, token) => {
    try {
        // Obtenemos la IP (v4) directa de Gmail para saltarnos el fallo de IPv6 de Railway
        const ipv4Addresses = await dns.resolve4('smtp.gmail.com');
        const smtpIp = ipv4Addresses[0];

        // Configuración forzando la IP directa
        const transporter = nodemailer.createTransport({
            host: smtpIp,
            port: 587, // Puerto 587 en lugar del 465 suele estar desbloqueado en Railway
            secure: false, // false significa que usará STARTTLS (seguro igualmente)
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false // Evita errores de certificado al usar IP en lugar de dominio
            },
            logger: true, // Habilita logs completos de Nodemailer
            debug: true   // Habilita el modo debug de Nodemailer
        });

        const verificationLink = `http://localhost:5173/verify-email?token=${token}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: 'Verifica tu cuenta en PKMHelper',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2>¡Bienvenido a PKMHelper!</h2>
                    <p>Gracias por registrarte. Para poder usar tu cuenta, por favor verifica tu correo electrónico haciendo clic en el siguiente enlace:</p>
                    <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; margin: 20px 0; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verificar cuenta</a>
                    <p>Si no puedes hacer clic en el botón, copia y pega el siguiente enlace en tu navegador:</p>
                    <p>${verificationLink}</p>
                    <p>Este enlace expirará en 1 hora.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Correo de verificación enviado a:', to);
        return info;
    } catch (error) {
        console.error('Error enviando el correo de verificación:', error);
        throw error;
    }
};

module.exports = {
    sendVerificationEmail
};
