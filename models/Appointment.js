import mongoose from 'mongoose'

const appointmentSchema = new mongoose.Schema({
    worker: {
        workerName: { type: String, trim: true, required: true },
        workerPosition: { type: String, trim: true },
        workerPhone: { type: String, match: /^[0-9]{10}$/ },
        workerNotes: { type: String }
    },
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Services' }],
    date: { type: Date },
    time: { type: String },
    totalAmount: { type: Number },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    googleCalendarEventId: { type: String }
})

const Appointment = mongoose.model('Appointment', appointmentSchema)
export default Appointment