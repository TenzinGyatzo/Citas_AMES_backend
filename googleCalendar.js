import fs from 'fs/promises';
import path from 'path'
import process from 'process'
import {authenticate} from '@google-cloud/local-auth'
import {google} from 'googleapis'

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  try {
    const content = await fs.readFile(CREDENTIALS_PATH);
    console.log('Archivo credentials.json cargado correctamente.');
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
      type: 'authorized_user',
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
    console.log('Credenciales guardadas correctamente en token.json');
  } catch (err) {
    console.error('Error al cargar credentials.json: ', err);
  }
}

/**
 * Load or request or authorization to call APIs.
 *
 */
let accessTokenCache = {
  client: null,
  expiryDate: null,
};

export async function authorize() {
  const currentTime = Date.now();

  // Log para verificar si estamos entrando en la sección de caché
  if (accessTokenCache.client && accessTokenCache.expiryDate > currentTime) {
    console.log("Usando cliente en caché. Expira en:", new Date(accessTokenCache.expiryDate).toLocaleTimeString());
    return accessTokenCache.client;
  }

  console.log("No se está usando el caché, cargando credenciales...");

  let client = await loadSavedCredentialsIfExist();

  if (client && client.credentials.refresh_token) {
    try {
      const tokenInfo = await client.getAccessToken();
      console.log("Token renovado exitosamente:", tokenInfo.token);

      // Almacena en caché el cliente y la fecha de expiración
      accessTokenCache.client = client;
      accessTokenCache.expiryDate = Date.now() + (60 * 60 * 1000); // Una hora a partir de ahora

      console.log("Cliente almacenado en caché. Expira en:", new Date(accessTokenCache.expiryDate).toLocaleTimeString());

      // Guarda las credenciales solo si el token fue renovado
      if (tokenInfo.token) {
        await saveCredentials(client);
      }

      return client;
    } catch (error) {
      console.error("Error al renovar token con refresh_token:", error);
    }
  }

  console.log('No se encontró cliente autorizado o el refresh_token es inválido. Iniciando proceso de autenticación...');
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });

  if (client.credentials) {
    console.log('Guardando credenciales...');
    await saveCredentials(client);
  }

  // Almacena el nuevo cliente en caché
  accessTokenCache.client = client;
  accessTokenCache.expiryDate = Date.now() + (60 * 60 * 1000);

  console.log("Nuevo cliente autenticado almacenado en caché. Expira en:", new Date(accessTokenCache.expiryDate).toLocaleTimeString());

  return client;
}




/**
 * Lists the next 5 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
 async function listEvents(auth) {
  const calendar = google.calendar({ version: 'v3', auth });
  const timeMin = new Date();

  // Obtener final del siguiente mes como fecha máxima
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0); 
  const timeMax = new Date(nextMonth.setHours(23, 59, 59, 999)); // Fin del día

  try {
    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 5,
    });

    const events = res.data.items;

    if (!events || events.length === 0) {
      console.log('No se encontraron eventos próximos.');
      return;
    }

    console.log('Próximos eventos:');
    events.map((event, i) => {
      const start = event.start.dateTime || event.start.date;
      console.log(`${start} - ${event.summary}`);
    });
  } catch (error) {
    console.error('Error fetching events:', error);
  }
} 


authorize().then(listEvents).catch(console.error);
