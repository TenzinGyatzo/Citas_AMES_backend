import { google } from 'googleapis';
import { readFile } from 'fs/promises';

/**
 * Función para autorizar usando la cuenta de servicio.
 * No requiere guardar ni renovar tokens, ya que utiliza un JWT.
 *
 * @return {Promise<google.auth.JWT>}
 */
export async function authorize() {
  // Ruta al archivo JSON descargado de la cuenta de servicio
  const credentials = JSON.parse(await readFile('citas-ames-b1b0b41e4919.json'));

  const client = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    ['https://www.googleapis.com/auth/calendar']
  );

  // Autorizar al cliente para que pueda realizar solicitudes
  await client.authorize();
  console.log("Autorización exitosa con la cuenta de servicio.");
  return client;
}

/**
 * Lista los próximos 5 eventos en el calendario principal.
 * @param {google.auth.JWT} auth Un cliente autorizado JWT.
 */
async function listEvents(auth) {
  const calendar = google.calendar({ version: 'v3', auth });

  try {
    const res = await calendar.events.list({
      calendarId: 'asesoria.medico.empresarial@gmail.com', // O usa el ID del calendario compartido si es necesario
      timeMin: (new Date()).toISOString(),
      maxResults: 5,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = res.data.items;

    if (events.length) {
      console.log('Próximos eventos:');
      events.map((event) => {
        const start = event.start.dateTime || event.start.date;
        console.log(`${start} - ${event.summary}`);
      });
    } else {
      console.log('No hay próximos eventos encontrados.');
    }
  } catch (error) {
    console.error('Error al listar los eventos:', error);
  }
}

/**
 * Ejecución del flujo de autorización y listado de eventos
 */
authorize().then(listEvents).catch(console.error);
