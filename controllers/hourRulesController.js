import HourRules from '../models/HourRules.js';

// Obtener las reglas actuales
const getHourRules = async (req, res) => {
  try {
    const currentRules = await HourRules.getCurrentRules();
    const rulesObject = currentRules.getRulesObject();
    
    res.json({
      success: true,
      data: rulesObject,
      updatedAt: currentRules.updatedAt,
      updatedBy: currentRules.updatedBy
    });
  } catch (error) {
    console.error('Error al obtener reglas de horarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reglas de horarios',
      error: error.message
    });
  }
};

// Actualizar las reglas de horarios
const updateHourRules = async (req, res) => {
  try {
    const { rules } = req.body;
    const userId = req.user.id; // Asumiendo que tienes middleware de autenticación

    if (!rules || typeof rules !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Las reglas son requeridas y deben ser un objeto'
      });
    }

    // Validar que todas las reglas sean números
    for (const [hour, limit] of Object.entries(rules)) {
      if (typeof limit !== 'number' || limit < 0) {
        return res.status(400).json({
          success: false,
          message: `El límite para ${hour} debe ser un número mayor o igual a 0`
        });
      }
    }

    // Crear nueva entrada de reglas
    const newRules = new HourRules({
      rules,
      updatedBy: userId
    });

    await newRules.save();

    const rulesObject = newRules.getRulesObject();

    res.json({
      success: true,
      message: 'Reglas de horarios actualizadas correctamente',
      data: rulesObject,
      updatedAt: newRules.updatedAt
    });
  } catch (error) {
    console.error('Error al actualizar reglas de horarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar reglas de horarios',
      error: error.message
    });
  }
};

// Obtener historial de cambios (opcional)
const getHourRulesHistory = async (req, res) => {
  try {
    const history = await HourRules.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('updatedBy', 'name email');

    res.json({
      success: true,
      data: history.map(entry => ({
        rules: entry.getRulesObject(),
        updatedAt: entry.updatedAt,
        updatedBy: entry.updatedBy
      }))
    });
  } catch (error) {
    console.error('Error al obtener historial de reglas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener historial de reglas',
      error: error.message
    });
  }
};

export {
  getHourRules,
  updateHourRules,
  getHourRulesHistory
}; 