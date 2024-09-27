import { createTransport } from '../config/nodemailer.js'

export async function sendEmailNewAppointment({company, workerName, date, time}) {
    const transporter = createTransport(
        process.env.EMAIL_HOST,
        process.env.EMAIL_PORT,
        process.env.EMAIL_USER,
        process.env.EMAIL_PASS
    );

    // Enviar el email
    const info = await transporter.sendMail({
        from: 'Citas AMES <citas@amescitas.com>',
        to: 'medicinaocupacional@ames.org.mx',
        subject: 'Citas AMES - Nueva Cita',
        text: 'Citas AMES - Nueva Cita',
        html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
            <h1 style="font-size: 24px; color: #2c3e50;">Nueva Cita Programada</h1>
            <p>Hola Admin, tienes una nueva cita.</p>
            <p><strong style="color: #27ae60;">${company}</strong> ha agendado una cita para <strong>${workerName}</strong>.</p>
            <p>La cita está programada para el día: <strong>${date}</strong> a las <strong>${time}</strong> horas.</p>
            <p>Revisa el panel de administración para ver los detalles.</p>
            <hr style="border: 1px solid #ddd;">
            <p style="font-size: 12px; color: #999;">Este es un correo automático, por favor no respondas a este mensaje.</p>
        </div>`
    });

    console.log('Mensaje enviado', info.messageId); 
}


export async function sendEmailUpdateAppointment({company, workerName, date, time}) {
    const transporter = createTransport(
        process.env.EMAIL_HOST,
        process.env.EMAIL_PORT,
        process.env.EMAIL_USER,
        process.env.EMAIL_PASS
    )

    // Enviar el email
    const info = await transporter.sendMail({
        from: 'Citas AMES <citas@amescitas.com>',
        to: 'medicinaocupacional@ames.org.mx',
        subject: 'Citas AMES - Cita Actualizada',
        text: 'Citas AMES - Cita Actualizada',
        html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
            <h1 style="font-size: 24px; color: #2c3e50;">Cita Actualizada</h1>
            <p>Hola Admin, un cliente ha modificado una cita.</p>
            <p><strong style="color: #27ae60;">${company}</strong> ha actualizado la cita para <strong>${workerName}</strong>.</p>
            <p>La nueva cita será el día: <strong>${date}</strong> a las <strong>${time}</strong> horas.</p>
            <hr style="border: 1px solid #ddd;">
            <p style="font-size: 12px; color: #999;">Este es un correo automático, por favor no respondas a este mensaje.</p>
        </div>`
    });

    console.log('Mensaje enviado', info.messageId);
    
}

export async function sendEmailCancelledAppointment({company, workerName, date, time}) {
    const transporter = createTransport(
        process.env.EMAIL_HOST,
        process.env.EMAIL_PORT,
        process.env.EMAIL_USER,
        process.env.EMAIL_PASS
    )

    // Enviar el email
    const info = await transporter.sendMail({
        from: 'Citas AMES <citas@amescitas.com>',
        to: 'medicinaocupacional@ames.org.mx',
        subject: 'Citas AMES - Cita Cancelada',
        text: 'Citas AMES - Cita Cancelada',
        html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
            <h1 style="font-size: 24px; color: #e74c3c;">Cita Cancelada</h1>
            <p>Hola Admin, un cliente ha cancelado una cita.</p>
            <p><strong style="color: #27ae60;">${company}</strong> ha cancelado la cita para <strong>${workerName}</strong>.</p>
            <p>La cita cancelada correspondía al día: <strong>${date}</strong> a las <strong>${time}</strong> horas.</p>
            <hr style="border: 1px solid #ddd;">
            <p style="font-size: 12px; color: #999;">Este es un correo automático, por favor no respondas a este mensaje.</p>
        </div>`
    });

    console.log('Mensaje enviado', info.messageId);
    
}