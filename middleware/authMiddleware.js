import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const authenticateToken = async (req, res, next) => {

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password -verified -token -__v');
            
            if (!req.user) {
                console.log('❌ authenticateToken: Usuario no encontrado en BD');
                return res.status(404).json({ msg: 'Usuario no encontrado' });
            }

            next(); // Asegúrate de que esto esté presente
        } catch (error) {
            console.log('❌ Error verificando token:', error);
            return res.status(403).json({ msg: 'Token no válido' });
        }
    } else {
        console.log('❌ authenticateToken: No hay token en headers');
        return res.status(403).json({ msg: 'Token no válido o inexistente' });
    }
};

const requireAdmin = async (req, res, next) => {
    if (!req.user) {
        console.log('❌ requireAdmin: No hay usuario en req.user');
        return res.status(401).json({ msg: 'Acceso no autorizado' });
    }

    if (!req.user.admin) {
        console.log('❌ requireAdmin: Usuario no es admin');
        return res.status(403).json({ msg: 'Se requieren permisos de administrador' });
    }

    next();
};

export { authenticateToken, requireAdmin }