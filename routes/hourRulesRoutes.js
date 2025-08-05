import express from 'express';
import { getHourRules, updateHourRules, getHourRulesHistory } from '../controllers/hourRulesController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ruta pública para obtener las reglas actuales (necesaria para el frontend)
router.get('/current', getHourRules);

// Rutas protegidas que requieren autenticación y permisos de administrador
router.get('/history', authenticateToken, requireAdmin, getHourRulesHistory);
router.put('/update', authenticateToken, requireAdmin, updateHourRules);

export default router; 