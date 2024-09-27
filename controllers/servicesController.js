import Services from '../models/Services.js';
import { validateObjectId, validateOjectExistence } from '../utils/index.js';

const createService = async (req, res) => {
    if(Object.values(req.body).includes('')) {
        const error = new Error ('All fields are required')
        return res.status(400).json({
            msg: error.message
        })   
    }
    
    try {
        const service = new Services(req.body);
        await service.save();

        res.json({
            msg: 'Service saved'
        });
    } catch (error) {
        console.log(error);
    }
}

const getAllServices = async (req, res) => {
    try {
        const services = await Services.find();
        res.json(services);
    } catch (error) {
        console.log(error);
    }
}

const getServiceById = async (req, res) => {
    // Validar un object id
    const serviceId = req.params.id
    if(validateObjectId(serviceId, res)) return

    // Validar que el objeto exista
    const service = await Services.findById(serviceId)
    if(validateOjectExistence(service, res)) return

    // Mostrar el servicio
    res.json(service)     
}

const updateService = async (req, res) => {
    // Validar un object id
    const serviceId = req.params.id
    if(validateObjectId(serviceId, res)) return

    // Validar que el objeto exista
    const service = await Services.findById(serviceId)
    if(validateOjectExistence(service, res)) return

    // Escribimos ne el objeto los valores nuevos
    service.name = req.body.name || service.name
    service.description = req.body.description || service.description
    service.price = req.body.price || service.price

    try {
        await service.save()
        res.json({msg: 'Service successfully updated'})
    } catch (error) {
        console.log(error);
    }

    // Mostrar
    console.log(service);
}

const deleteService = async (req, res) => {
    // Validar un object id
    const serviceId = req.params.id
    if(validateObjectId(serviceId, res)) return

    // Validar que el objeto exista
    const service = await Services.findById(serviceId)
    if(validateOjectExistence(service, res)) return

    // Eliminar
    try {
        await Services.findByIdAndDelete(serviceId)
        res.json({msg: 'Service deleted'})        
    } catch (error) {
        console.log(error);
        
    }
}

export { 
    createService,
    getAllServices,
    getServiceById,
    updateService,
    deleteService 
}