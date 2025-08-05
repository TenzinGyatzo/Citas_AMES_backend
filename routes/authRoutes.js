import express from 'express';
import { register, verifyAccount, login, user, forgotPassword, verifyPasswordResetToken, updatePassword, admin } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas de autenticación y registro de usuarios 

router.post('/register', register)
router.get('/verify/:token', verifyAccount )
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.route('/forgot-password/:token')
    .get(verifyPasswordResetToken)
    .post(updatePassword)


// Área privada - Requiere JWT
router.get('/user', authenticateToken, user )
router.get('/admin', authenticateToken, admin);


export default router