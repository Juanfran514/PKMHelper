const nodemailer = require('nodemailer');

const sendVerificationEmail = async (to, token) => {
    try {
        // Configuración para usar Gmail (o cualquier otro proveedor SMTP)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
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
