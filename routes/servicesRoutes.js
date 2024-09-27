import express from 'express';
import { createService, getAllServices, getServiceById, updateService, deleteService } from '../controllers/servicesController.js';

const router = express.Router();

/* router.post('/', createService)
router.get('/', getAllServices)
router.get('/:id', getServiceById)
router.put('/:id', updateService)
router.delete('/:id', deleteService) */

router.route('/')
    .post(createService)
    .get(getAllServices)

router.route('/:id')
    .get(getServiceById)
    .put(updateService)
    .delete(deleteService)


export default router