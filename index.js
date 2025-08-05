import express from 'express';
import dotenv from 'dotenv';
import colors from 'colors';
import cors from 'cors';
import { db } from './config/db.js'; 
import servicesRoutes from './routes/servicesRoutes.js';
import authRoutes from './routes/authRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import googleCalendarRoutes from './routes/googleCalendarRoutes.js';
import hourRulesRoutes from './routes/hourRulesRoutes.js'; 

// Cargar variables de entorno
dotenv.config();

// Configurar la app
const app = express();

// Leer datos via body
app.use(express.json());

// Conectar a la base de datos
db();

// Configurar CORS
const whiteList = [
    process.env.FRONTEND_URL_DEV, 
    process.env.FRONTEND_URL_IP,
    process.env.FRONTEND_URL_DOMAIN,
    process.env.FRONTEND_URL_DOMAIN_ALT,
    ]; // Agregar 'undefined' para permitir peticiones desde Postman
    
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || whiteList.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'],     // Cabeceras permitidas
};

app.use(cors(corsOptions))

// Definir rutas
app.use('/api/calendar', googleCalendarRoutes);
app.use('/api/services', servicesRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/users', userRoutes)
app.use('/api/hour-rules', hourRulesRoutes)

// Definir puerto
const PORT = process.env.PORT || 4000;

// Arrancar la app
app.listen(PORT, () => {
    console.log(colors.yellow.italic.bold('Servidor corriendo en el puerto:'), colors.cyan.italic.bold(PORT));
})
