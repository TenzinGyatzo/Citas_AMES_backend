import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import { format } from 'date-fns'
import es from 'date-fns/locale/es'

function validateObjectId(id, res) {
    if(!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error ('Object id is not valid')
        return res.status(400).json({
            msg: error.message
        }) 
    }
}

function validateOjectExistence(object, res) {
    if(!object) {
        const error = new Error ('object does not exist')
        return res.status(404).json({
            msg: error.message
        }) 
    }
}

const uniqueId = () => Date.now().toString(32) + Math.random().toString(32).substr(2)

const generateJWT = (id) => {
    const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d'})

    return token
}

function formatDate(date) {
    return format(date, 'PPPP', { locale: es })
}


export {
    validateObjectId,
    validateOjectExistence,
    uniqueId,
    generateJWT,
    formatDate
}