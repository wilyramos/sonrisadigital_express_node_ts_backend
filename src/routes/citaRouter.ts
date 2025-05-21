import { Router } from 'express';
import { handleInputErrors } from "../middleware/validation";
import { AppointmentController } from '../controllers/AppointmentController';
import { body, param } from "express-validator";
import { authenticate, isAdmin } from '../middleware/auth';



const router = Router();


// Crear una cita
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

// get appointments by patientId
router.get("/patient/:patientId",
    param('patientId')
        .isNumeric().withMessage('Invalid id'),
    handleInputErrors,
    AppointmentController.getAppointmentsByPatient
)

// getAppointmentsByPatientDNI
router.get("/paciente/dni/:dni",
    
    param('dni')
        .isString().withMessage('Invalid dni'),
    handleInputErrors,

    AppointmentController.getAppointmentsByPatientDNI
)

// get appointments by medicId
router.get("/medic/:medicId",
    param('medicId')
        .isNumeric().withMessage('Invalid id'),
    handleInputErrors,
    AppointmentController.getAppointmentsByMedic
)


router.get("/citas/search",
    authenticate,
    isAdmin,
    AppointmentController.getAppointmentsBySearch
)

// 
router.get("/",
    AppointmentController.getAppointments
)

// get appointments with pagination
router.get("/all/citas",
    authenticate,
    handleInputErrors,
    AppointmentController.getAppointmentsWithPagination
)

// get appointments by date
router.get("/citas/:date",
    param('date')
        .isDate().withMessage('Invalid date'),
    handleInputErrors,
    AppointmentController.getAppointmentByDate
)

// delete appointment
router.delete('/:id',
    authenticate,
    isAdmin,
    param('id')
        .isNumeric().withMessage('Invalid id'),
    handleInputErrors,
    AppointmentController.deleteAppointment
)

// get appointmets report weekly
router.get("/report/weekly",
    authenticate,
    isAdmin,
    AppointmentController.getAppointmentsReportWeekly
)

// get appointmets report monthly
router.get("/report/monthly",
    authenticate,
    isAdmin,
    AppointmentController.getAppointmentsReportLastYear
)

export default router;