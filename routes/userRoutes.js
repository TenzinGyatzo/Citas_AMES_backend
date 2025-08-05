import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { getUserAppointments } from '../controllers/userController.js';

const router = express.Router();

router.route('/:user/appointments')
    .get(authenticateToken, getUserAppointments)

export default router