import { authorize } from './googleCalendar.js';

authorize()
  .then(() => console.log('Autenticación completada y token guardado.'))
  .catch(error => console.error('Error en la autenticación:', error));
