import { google } from 'googleapis';
import { authorize } from '../googleCalendar.js';

export async function createCalendarEvent(appointment, user) {
  const auth = await authorize();
  const calendar = google.calendar({ version: 'v3', auth });

  const date = appointment.date ? appointment.date.toISOString().split('T')[0] : null;
  let time = appointment.time || null;

  // Asegura que la hora esté en formato HH:mm
  if (time && time.length < 5) {
    time = time.padStart(5, '0');
  }

  // Convierte la fecha y hora a UTC y luego suma 7 horas
  const offset = 7 * 60 * 60 * 1000; // 7 horas en milisegundos
  const startDateTime = new Date(new Date(`${date}T${time}:00Z`).getTime() + offset);
  const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000); // Media hora después

  const event = {
    summary: `${user.company}`,
    description: `Trabajador: ${appointment.worker.workerName}\nPosición: ${appointment.worker.workerPosition}\nTeléfono: ${appointment.worker.workerPhone}\nNotas: ${appointment.worker.workerNotes}\nServicios: ${appointment.services.map(s => s.name).join(', ')}`,
    start: {
      dateTime: startDateTime.toISOString()
    },
    end: {
      dateTime: endDateTime.toISOString()
    },
  };

  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });
    // console.log('Evento creado en Google Calendar:', response.data);
    console.log('Evento creado en Google Calendar');
    return response.data;
  } catch (error) {
    console.error('Error al crear el evento en Google Calendar:', error);
    throw error;
  }
}

export async function updateCalendarEvent(appointment, user) {
    const auth = await authorize();
    const calendar = google.calendar({ version: 'v3', auth });

    const date = appointment.date ? appointment.date.toISOString().split('T')[0] : null;
    let time = appointment.time || null;

    // Asegura que la hora esté en formato HH:mm
    if (time && time.length < 5) {
      time = time.padStart(5, '0');
    }

    // Convierte la fecha y hora a UTC y luego suma 7 horas
    const offset = 7 * 60 * 60 * 1000; // 7 horas en milisegundos
    const startDateTime = new Date(new Date(`${date}T${time}:00Z`).getTime() + offset);
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000); // Media hora después

      // Información del evento que deseas actualizar
    const event = {
      summary: `${user.company}`,
      description: `Trabajador: ${appointment.worker.workerName}\nPosición: ${appointment.worker.workerPosition}\nTeléfono: ${appointment.worker.workerPhone}\nNotas: ${appointment.worker.workerNotes}\nServicios: ${appointment.services.map(s => s.name).join(', ')}`,
      start: {
        dateTime: startDateTime.toISOString()
      },
      end: {
        dateTime: endDateTime.toISOString()
      },
    };

    try {
      // Verificar que el eventId esté definido
      if (!appointment.googleCalendarEventId) {
        throw new Error('El eventId de Google Calendar no está definido.');
      }

      // Usa el eventId del appointment para actualizar el evento en Google Calendar
      const response = await calendar.events.update({
        calendarId: 'primary',
        eventId: appointment.googleCalendarEventId,
        resource: event,
      });

      console.log('Evento actualizado en Google Calendar');
      // console.log('Evento actualizado en Google Calendar:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar el evento en Google Calendar:', error);
      throw error;
    }
}

export async function deleteCalendarEvent(appointment, user) {
  const auth = await authorize();
  const calendar = google.calendar({ version: 'v3', auth });

  try {
    // Verificar que el eventId esté definido
    if (!appointment.googleCalendarEventId) {
      throw new Error('El eventId de Google Calendar no está definido.');
    }

    // Usa el eventId del appointment para borrar el evento en Google Calendar
    const response = await calendar.events.delete({
      calendarId: 'primary',
      eventId: appointment.googleCalendarEventId,
    });

    console.log('Evento eliminado de Google Calendar');
    // console.log('Evento eliminado de Google Calendar:', response.data);
    return { message: 'Evento eliminado' }    ;
  } catch (error) {
    console.error('Error al borrar el evento en Google Calendar:', error);
    throw error;
  }
}

export async function getCalendarEventsByDate(date) {
  const auth = await authorize();
  const calendar = google.calendar({ version: 'v3', auth });

  // Define la fecha de inicio y fin para consultar los eventos
  const startDate = new Date(date);
  const endDate = new Date(date);
  endDate.setDate(endDate.getDate() + 1); // Un día después para obtener todo el día seleccionado

  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items.map(event => ({
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      summary: event.summary,
    }));

    return events;
  } catch (error) {
    console.error('Error al obtener eventos de Google Calendar:', error);
    throw error;
  }
}

