import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { authenticate, isAdmin } from "../middleware/auth";
import { MedicController } from "../controllers/MedicController";
// import { limiter } from "../config/limiter";
// import { authenticate } from "../middleware/auth";


const router = Router();

router.post('/create-account',
    body('name')
        .notEmpty().withMessage('Name is required'),
    body('phone')
        .notEmpty().withMessage('Phone is required'),
    body('speciality')
        .notEmpty().withMessage('Speciality is required'),
    body('email')
        .isEmail().withMessage('Email is not valid'),
    
    handleInputErrors,
    MedicController.createAccount
);

router.get('/medics',
    authenticate,
    isAdmin,
    MedicController.getMedics
)

router.get('/:medicId',
    authenticate,
    MedicController.getMedicById
);

// DELETE medic
router.delete('/:medicId',
    authenticate,
    isAdmin,
    MedicController.deleteMedicById
)

router.put('/:medicId',
    authenticate,
    isAdmin,
    body('email')
        .isEmail().withMessage('Email is not valid'),
    body('name')
        .notEmpty().withMessage('Name is required'),
    handleInputErrors,
    MedicController.updateMedic
)

// Search medic  - get medics 
router.get('/',
    authenticate,
    isAdmin,
    MedicController.searchMedics
)

export default router;