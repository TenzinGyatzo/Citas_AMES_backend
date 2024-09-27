import express from 'express';
import { getCalendarEventsByDate } from '../controllers/googleCalendarController.js';

const router = express.Router();

router.get('/events-by-date/:date', async (req, res) => {
    try {
      const date = req.params.date;
      const events = await getCalendarEventsByDate(date);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener eventos' });
    }
  });
  

export default router;
