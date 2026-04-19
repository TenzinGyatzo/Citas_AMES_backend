import HourRules from '../models/HourRules.js';

const WEEK_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const isValidRulesObject = (rules) => {
  if (!rules || typeof rules !== 'object' || Array.isArray(rules)) {
    return false;
  }

  for (const [hour, limit] of Object.entries(rules)) {
    if (typeof limit !== 'number' || limit < 0) {
      throw new Error(`El límite para ${hour} debe ser un número mayor o igual a 0`);
    }
  }

  return true;
};

const normalizeWeeklyRules = (weeklyRules, fallbackRules = {}) => {
  const normalized = {};

  WEEK_DAYS.forEach((day) => {
    const dayRules = weeklyRules?.[day];
    normalized[day] = dayRules && typeof dayRules === 'object' && !Array.isArray(dayRules)
      ? { ...dayRules }
      : { ...fallbackRules };
  });

  return normalized;
};

// Obtener las reglas actuales
const getHourRules = async (req, res) => {
  try {
    const currentRules = await HourRules.getCurrentRules();
    const rulesObject = currentRules.getRulesObject();
    const weeklyRulesObject = currentRules.getWeeklyRulesObject();
    
    res.json({
      success: true,
      data: rulesObject,
      rules: rulesObject,
      weeklyRules: weeklyRulesObject,
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
    const { rules, weeklyRules } = req.body;
    const userId = req.user.id; // Asumiendo que tienes middleware de autenticación

    const hasRules = !!rules;
    const hasWeeklyRules = !!weeklyRules;

    if (!hasRules && !hasWeeklyRules) {
      return res.status(400).json({
        success: false,
        message: 'Debes enviar "rules" o "weeklyRules"'
      });
    }

    let normalizedRules = {};
    let normalizedWeeklyRules = {};

    try {
      if (hasRules) {
        isValidRulesObject(rules);
        normalizedRules = { ...rules };
      }

      if (hasWeeklyRules) {
        if (typeof weeklyRules !== 'object' || Array.isArray(weeklyRules)) {
          throw new Error('weeklyRules debe ser un objeto con llaves monday a saturday');
        }

        const fallbackForMissingDays = hasRules ? normalizedRules : {};
        normalizedWeeklyRules = normalizeWeeklyRules(weeklyRules, fallbackForMissingDays);

        WEEK_DAYS.forEach((day) => {
          isValidRulesObject(normalizedWeeklyRules[day]);
        });
      } else {
        normalizedWeeklyRules = normalizeWeeklyRules({}, normalizedRules);
      }
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError.message
      });
    }

    if (!hasRules) {
      normalizedRules = { ...(normalizedWeeklyRules.monday || {}) };
    }

    // Crear nueva entrada de reglas
    const newRules = new HourRules({
      rules: normalizedRules,
      weeklyRules: normalizedWeeklyRules,
      updatedBy: userId
    });

    await newRules.save();

    const rulesObject = newRules.getRulesObject();
    const weeklyRulesObject = newRules.getWeeklyRulesObject();

    res.json({
      success: true,
      message: 'Reglas de horarios actualizadas correctamente',
      data: rulesObject,
      rules: rulesObject,
      weeklyRules: weeklyRulesObject,
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
        weeklyRules: entry.getWeeklyRulesObject(),
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