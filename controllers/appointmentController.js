import { parse, formatISO, startOfDay, endOfDay, isValid } from 'date-fns'
import Appointment from '../models/Appointment.js'
import { validateObjectId, validateOjectExistence, formatDate } from '../utils/index.js';
import { sendEmailNewAppointment, sendEmailUpdateAppointment, sendEmailCancelledAppointment } from '../emails/appointmentEmailService.js'
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from '../controllers/googleCalendarController.js';

const createAppointment = async (req, res) => {
    const appointment = req.body;
    appointment.user = req.user._id.toString();

    try {
        // Guarda el appointment para poder hacer el populate correctamente
        const newAppointment = new Appointment(appointment);
        const result = await newAppointment.save();

        // Realiza el populate de 'services' y 'worker' después de guardar el appointment
        const populatedAppointment = await Appointment.findById(result._id).populate('services');

        // Crea el evento en Google Calendar y obtén el eventId
        const { id: eventId } = await createCalendarEvent(populatedAppointment, req.user);

        // Guarda el eventId en el appointment ya guardado
        populatedAppointment.googleCalendarEventId = eventId;
        await populatedAppointment.save();

        // Enviar el email de confirmación
        await sendEmailNewAppointment({
            company: req.user.company,
            workerName: populatedAppointment.worker.workerName,
            date: formatDate(populatedAppointment.date),
            time: populatedAppointment.time,
        });

        res.json({
            msg: 'Cita creada correctamente',
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error al crear la cita' });
    }
};


const getAppointmentsByDate = async (req, res) => {
    const { date } = req.query    

    const newDate = parse(date, 'dd/MM/yyyy', new Date())

    if(!isValid(newDate)) {
        const error = new Error('Fecha no válida')
        return res.status(400).json({ msg: error.message })
    }

    const isoDate = formatISO(newDate)
    const appointments = await Appointment.find({
        date: {
            $gte: startOfDay(new Date(isoDate)),
            $lte: endOfDay(new Date(isoDate))
        }
    }).select('time')

    res.json(appointments)
}

const getAppointmentById = async (req, res) => {
    const id = req.params.id

    // Validar por object id
    if(validateObjectId(id, res)) return

    // Validar que el objeto exista
    const appointment = await Appointment.findById(id).populate('services')
    if(validateOjectExistence(appointment, res)) return

    if(appointment.user.toString() !== req.user._id.toString()) {
        const error = new Error('Acceso no autorizado')
        return res.status(403).json({ msg: error.message })
    }

    // Retornar la cita
    res.json(appointment)
}

const updateAppointment = async (req, res) => {
    const id = req.params.id

    // Validar por object id
    if(validateObjectId(id, res)) return

    // Validar que el objeto exista
    const appointment = await Appointment.findById(id).populate('services')
    if(validateOjectExistence(appointment, res)) return

    if(appointment.user.toString() !== req.user._id.toString()) {
        const error = new Error('Acceso no autorizado')
        return res.status(403).json({ msg: error.message })
    }

    const { date, time, totalAmount, services, company, worker } = req.body
    appointment.date = date
    appointment.time = time
    appointment.totalAmount = totalAmount
    appointment.services = services
    appointment.company = company
    appointment.worker = worker

    try {
        const result = await appointment.save()
        const populatedAppointment = await Appointment.findById(result._id).populate('services');

        await updateCalendarEvent(populatedAppointment, req.user);

        await sendEmailUpdateAppointment({
            company: req.user.company,
            workerName: result.worker.workerName,
            date: formatDate(result.date),
            time: result.time
        })

        res.json({
            msg: 'Cita actualizada correctamente',
        })
    } catch (error) {
        console.log(error);
    }
    
}

const deleteAppointment = async (req, res) => {
    const id = req.params.id

    // Validar por object id
    if(validateObjectId(id, res)) return

    // Validar que el objeto exista
    const appointment = await Appointment.findById(id).populate('services')
    if(validateOjectExistence(appointment, res)) return

    if(appointment.user.toString() !== req.user._id.toString()) {
        const error = new Error('Acceso no autorizado')
        return res.status(403).json({ msg: error.message })
    }

    try {
        // Guardar datos antes de borrar, para enviar el email de cancelación
        const workerName = appointment.worker.workerName
        const appointmentDate = formatDate(appointment.date)
        const appointmentTime = appointment.time

        await deleteCalendarEvent(appointment, req.user);
        
        await appointment.deleteOne()


        sendEmailCancelledAppointment({
            company: req.user.company,
            workerName: workerName,
            date: appointmentDate,
            time: appointmentTime
        })

        res.json({msg: 'Cita Cancelada Exitosamente'})
    } catch (error) {
        console.log(error);
    }
}

export {
    createAppointment,
    getAppointmentsByDate,
    getAppointmentById,
    updateAppointment,
    deleteAppointment
}