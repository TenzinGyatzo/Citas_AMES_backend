import mongoose from 'mongoose';
import dotenv from 'dotenv';
import HourRules from '../models/HourRules.js';

// Cargar variables de entorno
dotenv.config();

// Conectar a la base de datos
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Base de datos conectada');
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error);
    process.exit(1);
  }
};

// Reglas por defecto
const defaultRules = {
  "8:00": 1, "8:30": 1, "9:00": 1, "9:30": 1, "10:00": 1, "10:30": 1,
  "11:00": 1, "11:30": 1, "12:00": 1, "12:30": 1, "13:00": 1, "13:30": 1,
  "14:00": 1, "14:30": 1, "15:00": 1, "15:30": 1, "16:00": 1, "16:30": 1,
  "17:00": 1, "17:30": 1
};

// Función para inicializar las reglas
const initHourRules = async () => {
  try {
    // Verificar si ya existen reglas
    const existingRules = await HourRules.findOne().sort({ createdAt: -1 });
    
    if (existingRules) {
      console.log('ℹ️  Las reglas de horarios ya existen en la base de datos');
      console.log('📅 Última actualización:', existingRules.updatedAt);
      return;
    }

    // Crear reglas por defecto
    const newRules = new HourRules({
      rules: defaultRules,
      updatedBy: null // Se actualizará cuando se modifique desde la API
    });

    await newRules.save();
    console.log('✅ Reglas de horarios inicializadas correctamente');
    console.log('📋 Reglas creadas:', Object.keys(defaultRules).length, 'horarios');

  } catch (error) {
    console.error('❌ Error inicializando reglas de horarios:', error);
  }
};

// Ejecutar el script
const run = async () => {
  console.log('🚀 Iniciando script de inicialización de reglas de horarios...');
  
  await connectDB();
  await initHourRules();
  
  console.log('✅ Script completado');
  process.exit(0);
};

run(); 