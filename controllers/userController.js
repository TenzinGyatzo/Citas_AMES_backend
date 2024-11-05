import Appointment from "../models/Appointment.js";
import { startOfDay, subDays } from "date-fns";

const getUserAppointments = async (req, res) => {
  const { user } = req.params;

  if (user !== req.user._id.toString()) {
    const error = new Error("Acceso Denegado");
    return res.status(400).json({ msg: error.message });
  }

  try {
    // Cuando cambio el horario en estados unidos, dejo de traerse las citas de hoy, porlo que ahora indico que se traiga las citas de ayer para compensar ese desfase
    // const today = startOfDay(new Date());
    const today = startOfDay(subDays(new Date(), 1)); // Traigo las citas de ayer (hoy - 1) | En realidad se trae las de hoy en adelante.
    const query = req.user.admin
      ? { date: { $gte: today } }
      : { user: user, date: { $gte: today } };
    const appointments = await Appointment.find(query)
      .populate("services")
      .populate({ path: "user", select: "company name lastName phone email" })
      .sort({ date: "asc" });

    res.json(appointments);
  } catch (error) {
    console.log(error);
  }
};

export { getUserAppointments };
