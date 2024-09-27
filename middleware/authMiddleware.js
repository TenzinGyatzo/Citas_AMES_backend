import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const authMiddleware = async (req, res, next) => {

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password -verified -token -__v');
            
            if (!req.user) {
                return res.status(404).json({ msg: 'Usuario no encontrado' });
            }

            next(); // Asegúrate de que esto esté presente
        } catch (error) {
            console.log('Error verificando token:', error);
            return res.status(403).json({ msg: 'Token no válido' });
        }
    } else {
        return res.status(403).json({ msg: 'Token no válido o inexistente' });
    }
};


export default authMiddleware