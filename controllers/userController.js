import Appointment from "../models/Appointment.js";
import { startOfDay, subDays } from "date-fns";
import mongoose from "mongoose";

const getUserAppointments = async (req, res) => {
  const { user } = req.params;

  if (user !== req.user._id.toString()) {
    const error = new Error("Acceso Denegado");
    return res.status(400).json({ msg: error.message });
  }

  try {
    const today = startOfDay(subDays(new Date(), 1));

    // Ajusta el query para convertir user a ObjectId si no es admin
    const query = req.user.admin
      ? { date: { $gte: today } }
      : { user: new mongoose.Types.ObjectId(user), date: { $gte: today } };

    const appointments = await Appointment.aggregate([
      { $match: query }, // Aplica el filtro
      {
        $addFields: {
          timeNumeric: {
            $add: [
              {
                $multiply: [
                  { $toInt: { $arrayElemAt: [{ $split: ["$time", ":"] }, 0] } },
                  60,
                ],
              }, // Convierte horas a minutos
              { $toInt: { $arrayElemAt: [{ $split: ["$time", ":"] }, 1] } }, // Agrega los minutos
            ],
          },
        },
      },
      { $sort: { date: 1, timeNumeric: 1 } },
      {
        $lookup: {
          from: "services",
          localField: "services",
          foreignField: "_id",
          as: "services",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
    ]);

    res.json(appointments);
  } catch (error) {
    console.log(error);
  }
};

export { getUserAppointments };
