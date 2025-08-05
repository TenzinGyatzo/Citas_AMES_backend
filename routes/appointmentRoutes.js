import express from 'express';
import { createAppointment, getAppointmentsByDate, getAppointmentById, updateAppointment, deleteAppointment } from '../controllers/appointmentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(authenticateToken, createAppointment)
.get(authenticateToken, getAppointmentsByDate)

router.route('/:id')
    .get(authenticateToken, getAppointmentById)
.put(authenticateToken, updateAppointment)
.delete(authenticateToken, deleteAppointment)

export default router