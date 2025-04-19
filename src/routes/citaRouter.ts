import { Router } from 'express';
import { handleInputErrors } from "../middleware/validation";
import { AppointmentController } from '../controllers/AppointmentController';
import { body, param } from "express-validator";



const router = Router();


router.post('/',

    body('medicId')
        .notEmpty().withMessage('Medic is required'),
    body('patientId')
        .notEmpty().withMessage('Patient is required'),
    body('date')
        .notEmpty().withMessage('Date is required'),
    body('description')
        .notEmpty().withMessage('Description is required'),

    handleInputErrors,
    AppointmentController.createAppointment
)

// obtener cita por id
router.get('/:id',
    param('id')
        .isNumeric().withMessage('Invalid id'),

    handleInputErrors,
    AppointmentController.getAppointmentById
)

// Actualizar el estado de la cita
router.put('/:id/status',
    param('id')
        .isNumeric().withMessage('Invalid id'),
    body('status')
        .notEmpty().withMessage('Status is required'),

    handleInputErrors,
    AppointmentController.updateStatusAppointment
)

// Obtener todas las citas


router.put('/cancel/:id',
    param('id')
        .isNumeric().withMessage('Invalid id'),

    handleInputErrors,
    AppointmentController.cancelAppointment
)

router.put('/reschedule/:id',
    param('id')
        .isNumeric().withMessage('Invalid id'),

    handleInputErrors,
    AppointmentController.rescheduleAppointment
)

// Listadoss

router.get("/patient/:patientId",
    param('patientId')
        .isNumeric().withMessage('Invalid id'),
    handleInputErrors,
    AppointmentController.getAppointmentsByPatient
)

router.get("/medic/:medicId",
    param('medicId')
        .isNumeric().withMessage('Invalid id'),
    handleInputErrors,
    AppointmentController.getAppointmentsByMedic
)

router.get("/",
    AppointmentController.getAppointments
)

// get appointments by date
router.get("/citas/:date",
    param('date')
        .isDate().withMessage('Invalid date'),
    handleInputErrors,
    AppointmentController.getAppointmentByDate
)




export default router;