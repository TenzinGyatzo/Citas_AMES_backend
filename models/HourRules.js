import mongoose from 'mongoose';

const hourRulesSchema = new mongoose.Schema({
  rules: {
    type: Map,
    of: Number,
    default: {
      "8:00": 1, "8:30": 1, "9:00": 1, "9:30": 1, "10:00": 1, "10:30": 1,
      "11:00": 1, "11:30": 1, "12:00": 1, "12:30": 1, "13:00": 1, "13:30": 1,
      "14:00": 1, "14:30": 1, "15:00": 1, "15:30": 1, "16:00": 1, "16:30": 1,
      "17:00": 1, "17:30": 1
    }
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Permitir null para la inicialización automática
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Método para obtener las reglas como objeto plano
hourRulesSchema.methods.getRulesObject = function() {
  const rulesObject = {};
  this.rules.forEach((value, key) => {
    rulesObject[key] = value;
  });
  return rulesObject;
};

// Método estático para obtener las reglas actuales
hourRulesSchema.statics.getCurrentRules = async function() {
  const currentRules = await this.findOne().sort({ createdAt: -1 });
  if (!currentRules) {
    // Crear reglas por defecto si no existen
    const defaultRules = new this({
      rules: {
        "8:00": 1, "8:30": 1, "9:00": 1, "9:30": 1, "10:00": 1, "10:30": 1,
        "11:00": 1, "11:30": 1, "12:00": 1, "12:30": 1, "13:00": 1, "13:30": 1,
        "14:00": 1, "14:30": 1, "15:00": 1, "15:30": 1, "16:00": 1, "16:30": 1,
        "17:00": 1, "17:30": 1
      },
      updatedBy: null // Se actualizará cuando se cree desde la API
    });
    await defaultRules.save();
    console.log('✅ Reglas por defecto creadas automáticamente');
    return defaultRules;
  }
  return currentRules;
};

export default mongoose.model('HourRules', hourRulesSchema); 