import User from '../models/User.js'
import { sendEmailVerification, sendEmailPasswordReset } from '../emails/authEmailService.js'
import { generateJWT, uniqueId } from '../utils/index.js'

const register = async (req, res) => {

    // Valida todos los campos
    if(Object.values(req.body).includes('')) {
        const error = new Error ('Todos los campos son obligatorios')
        return res.status(400).json({ msg: error.message })
    }

    // Valida que el email sea unico
    const userExists = await User.findOne({email: req.body.email})
    if(userExists) {
        const error = new Error ('El email ya se encuentra registrado')
        return res.status(400).json({ msg: error.message })
    }

    // Valida la extensión del password
    const password = req.body.password
    const MIN_PASSWORD_LENGTH = 8 
    if(password.trim().length < MIN_PASSWORD_LENGTH) {
        const error = new Error (`El password debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`)
        return res.status(400).json({ msg: error.message })
    }

    // Crea el usuario
    try {
        const user = new User(req.body)
        const result = await user.save()

        const { name, email, token } = result
        sendEmailVerification({ name: name, email: email, token: token})
        
        res.json({
            msg: 'El usuario se creó correctamente, revisa tu email'
        })
    } catch (error) {
        console.log(error);
    }
}

const verifyAccount = async (req, res) => {
    const { token } = req.params
    
    const user = await User.findOne({token: token})
    if(!user) {
        const error = new Error ('El token no es valido')
        return res.status(401).json({ msg: error.message })
    }

    // Si el token es valido, confirmar la cuenta
    try {
        user.verified = true
        user.token = ''
        await user.save()
        res.json({ msg: 'Cuenta confirmada correctamente' })
    } catch (error) {
        console.log(error);
    }
    
}

const login = async (req, res) => {
    const { email, password } = req.body

    // Revisar que el usuario exista
    const user = await User.findOne({email: email})
    if(!user) {
        const error = new Error ('El usuario no existe')
        return res.status(404).json({ msg: error.message })
    }

    // Revisar si el usuario confirmo la cuenta
    if(!user.verified) {
        const error = new Error ('La cuenta no ha sido confirmada')
        return res.status(401).json({ msg: error.message })
    }

    // Comprobar el password
    if(await user.checkPassword(password)) {
        const token = generateJWT(user._id)
        res.json({
            token
        })
    } else {
        const error = new Error ('El password es incorrecto')
        return res.status(401).json({ msg: error.message })
    }
}

const forgotPassword = async (req, res) => {
    const { email } = req.body

    // Comprobar que el usuario exista
    const user = await User.findOne({email: email})
    if(!user) {
        const error = new Error ('El usuario no existe')
        return res.status(404).json({ msg: error.message })
    }

    // Generar el token
    try {
        user.token = uniqueId()
        const result = await user.save()

        await sendEmailPasswordReset({
            name: result.name, 
            email: result.email, 
            token: result.token})

        res.json({ msg: 'Hemos enviado un email con las instrucciones'})
    } catch (error) {
        console.log(error);
    }
    
}

const verifyPasswordResetToken = async (req, res) => {
    const { token } = req.params
    
    const isValidToken = await User.findOne({token: token})
    if(!isValidToken) {
        const error = new Error ('Hubo un error, el token no es válido')
        return res.status(400).json({ msg: error.message })
    }

    res.json({ msg: 'El token es válido'})
    
}

const updatePassword = async (req, res) => {
    const { token } = req.params
    const user = await User.findOne({token: token})
    if(!user) {
        const error = new Error ('Hubo un error, el token no es válido')
        return res.status(400).json({ msg: error.message })
    }

    const { password } = req.body

    try {
        user.token = ''
        user.password = password
        await user.save()

        res.json({ msg: 'Contraseña modificada correctamente'})
    } catch (error) {
        console.log(error);
    }
}

const user = async (req, res) => {
    const { user } = req
    res.json(
        user
    )  
}

const admin = async (req, res) => {
    const { user } = req;
    if (!user) {
        console.log('Usuario no encontrado en req.user');
        return res.status(403).json({ msg: 'Usuario no encontrado' });
    }

    if (!user.admin) {
        console.log('No es admin');
        const error = new Error('Acción no válida');
        return res.status(403).json({ msg: error.message });
    }

    res.json(user);  
}


export {
    register,
    verifyAccount,
    login,
    forgotPassword,
    verifyPasswordResetToken,
    updatePassword,
    user,
    admin
}