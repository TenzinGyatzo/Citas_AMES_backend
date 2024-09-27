import { createTransport } from '../config/nodemailer.js'

export async function sendEmailVerification({name, email, token}) {
    const transporter = createTransport(
        process.env.EMAIL_HOST,
        process.env.EMAIL_PORT,
        process.env.EMAIL_USER,
        process.env.EMAIL_PASS
    )
    
    // Enviar el email
    const info = await transporter.sendMail({
        from: 'Citas AMES <cuentas@amescitas.com>',
        to: email,
        subject: 'Citas AMES - Confirma tu cuenta',
        text: 'Citas AMES - Confirma tu cuenta',
        html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
            <h1 style="font-size: 24px; color: #2c3e50;">Confirma tu Cuenta</h1>
            <p>Hola <strong>${name}</strong>, confirma tu cuenta en Citas AMES.</p>
            <p>Tu cuenta está casi lista, solo debes confirmarla haciendo clic en el siguiente enlace:</p>
            <p><a href="${process.env.FRONTEND_URL_DOMAIN}/auth/confirmar-cuenta/${token}" style="background-color: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirmar Cuenta</a></p>
            <p>Si tú no creaste esta cuenta, puedes ignorar este mensaje.</p>
            <hr style="border: 1px solid #ddd;">
            <p style="font-size: 12px; color: #999;">Este es un correo automático, por favor no respondas a este mensaje.</p>
        </div>`
    });

    console.log('Mensaje enviado', info.messageId);
}

export async function sendEmailPasswordReset({name, email, token}) {
    const transporter = createTransport(
        process.env.EMAIL_HOST,
        process.env.EMAIL_PORT,
        process.env.EMAIL_USER,
        process.env.EMAIL_PASS
    )
    
    // Enviar el email
    const info = await transporter.sendMail({
        from: 'Citas AMES <cuentas@amescitas.com>',
        to: email,
        subject: 'Citas AMES - Restablece tu contraseña',
        text: 'Citas AMES - Restablece tu contraseña',
        html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
            <h1 style="font-size: 24px; color: #2c3e50;">Restablece tu Contraseña</h1>
            <p>Hola <strong>${name}</strong>, has solicitado restablecer tu contraseña.</p>
            <p>Sigue el siguiente enlace para generar una nueva contraseña:</p>
            <p><a href="${process.env.FRONTEND_URL_DOMAIN}/auth/olvide-password/${token}" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a></p>
            <p>Si tú no solicitaste esto, puedes ignorar este mensaje.</p>
            <hr style="border: 1px solid #ddd;">
            <p style="font-size: 12px; color: #999;">Este es un correo automático, por favor no respondas a este mensaje.</p>
        </div>`
    });

    console.log('Mensaje enviado', info.messageId);
    
}