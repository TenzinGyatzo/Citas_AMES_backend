import { parse, isValid } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import Appointment from '../models/Appointment.js'
import { validateObjectId, validateOjectExistence, formatDate } from '../utils/index.js';
import { sendEmailNewAppointment, sendEmailUpdateAppointment, sendEmailCancelledAppointment } from '../emails/appointmentEmailService.js'
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from '../controllers/googleCalendarController.js';

const BUSINESS_TIMEZONE = 'America/Hermosillo';

async function findAppointmentsByCalendarDate(dateParam) {
    const parsedDate = parse(dateParam, 'dd/MM/yyyy', new Date());

    if (!isValid(parsedDate)) {
        throw new Error('Fecha no válida');
    }

    const [day, month, year] = dateParam.split('/').map(Number);
    const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00-07:00`;
    const dateStr = formatInTimeZone(new Date(isoDate), BUSINESS_TIMEZONE, 'yyyy-MM-dd');
    const start = new Date(`${dateStr}T00:00:00-07:00`);
    const end = new Date(`${dateStr}T23:59:59.999-07:00`);
    const legacyStart = new Date(start.getTime() - 24 * 60 * 60 * 1000);
    const legacyEnd = new Date(end.getTime() + 24 * 60 * 60 * 1000);

    const appointments = await Appointment.find({
        date: { $gte: legacyStart, $lte: legacyEnd }
    }).select('time _id date');

    return appointments
        .filter((apt) => {
            if (!apt.date) return false;
            return formatInTimeZone(apt.date, BUSINESS_TIMEZONE, 'yyyy-MM-dd') === dateStr;
        })
        .map(({ _id, time }) => ({ _id, time }));
}

const createAppointment = async (req, res) => {
    const appointment = req.body;
    appointment.user = req.user._id.toString();

    try {
        const newAppointment = new Appointment(appointment);
        const result = await newAppointment.save();

        const populatedAppointment = await Appointment.findById(result._id).populate('services');

        const { id: eventId } = await createCalendarEvent(populatedAppointment, req.user);

        populatedAppointment.googleCalendarEventId = eventId;
        await populatedAppointment.save();

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
    try {
        const appointments = await findAppointmentsByCalendarDate(req.query.date);
        res.json(appointments);
    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
};

const getOccupancyByDate = async (req, res) => {
    try {
        const appointments = await findAppointmentsByCalendarDate(req.query.date);
        res.json(appointments.map(({ time }) => time).filter(Boolean));
    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
};

const getAppointmentById = async (req, res) => {
    const id = req.params.id

    if(validateObjectId(id, res)) return

    const appointment = await Appointment.findById(id).populate('services')
    if(validateOjectExistence(appointment, res)) return

    if(appointment.user.toString() !== req.user._id.toString()) {
        const error = new Error('Acceso no autorizado')
        return res.status(403).json({ msg: error.message })
    }

    res.json(appointment)
}

const updateAppointment = async (req, res) => {
    const id = req.params.id

    if(validateObjectId(id, res)) return

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

    if(validateObjectId(id, res)) return

    const appointment = await Appointment.findById(id).populate('services')
    if(validateOjectExistence(appointment, res)) return

    if(appointment.user.toString() !== req.user._id.toString()) {
        const error = new Error('Acceso no autorizado')
        return res.status(403).json({ msg: error.message })
    }

    try {
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
    getOccupancyByDate,
    getAppointmentById,
    updateAppointment,
    deleteAppointment
}
