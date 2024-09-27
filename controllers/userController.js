import Appointment from '../models/Appointment.js'
import { startOfDay } from 'date-fns'

const getUserAppointments = async (req, res) => {
    const { user } = req.params

    if(user !== req.user._id.toString()) {
        const error = new Error('Acceso Denegado')
        return res.status(400).json({ msg: error.message })
    }

    try {
        const today = startOfDay(new Date())
        const query = req.user.admin ? {date: { $gte: today }} : {user: user, date: { $gte: today }}
        const appointments = await Appointment
                .find(query)
                .populate('services')
                .populate({path: 'user', select: 'company name lastName phone email'})
                .sort({ date: 'asc'})

        res.json(appointments)

    } catch (error) {
        console.log(error)
    }
}

export { 
    getUserAppointments 
}