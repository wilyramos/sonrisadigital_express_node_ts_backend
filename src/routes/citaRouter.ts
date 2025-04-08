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


    handleInputErrors,
    AppointmentController.createAppointment
)

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

// Listados

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




export default router;