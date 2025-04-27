import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { authenticate, isAdmin } from "../middleware/auth";
// import { limiter } from "../config/limiter";
// import { authenticate } from "../middleware/auth";


const router = Router();

// Limit the number of requests to the API
// router.use(limiter);

router.post('/create-account',
    body('name')
        .notEmpty().withMessage('Name is required'),

    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

    body('email')
        .isEmail().withMessage('Email is not valid'),

    handleInputErrors,
    AuthController.createAccount
);

// Route to create a user by admin
router.post('/create-user-by-admin',
    authenticate,
    isAdmin,
    body('name')
        .notEmpty().withMessage('Name is required'),
    body('email')
        .isEmail().withMessage('Email is not valid'),
    body('phone')
        .optional()
        .isString().withMessage('Phone must be a string'),
    handleInputErrors,
    AuthController.createUserByAdmin
);

router.post('/login',
    body('email')
        .isEmail().withMessage('Email is not valid'),

    body('password')
        .notEmpty().withMessage('Password is required'),

    handleInputErrors,
    AuthController.login
)

router.get("/user", 
    authenticate,
    AuthController.user
);

router.get("/users",
    authenticate,
    AuthController.getUsers
)

router.put('/update-profile/:idUser',
    authenticate,
    isAdmin,
    body('name')
        .notEmpty().withMessage('Name is required'),
    body('email')
        .isEmail().withMessage('Email is not valid'),

    handleInputErrors,
    AuthController.updateProfile
)

router.delete('/delete-account/:idUser',
    authenticate,
    isAdmin,
    AuthController.deleteUser
)

router.get("/users/search",
    authenticate,
    isAdmin,
    AuthController.searchUsers
)

// get user by id
router.get('/user/:idUser',
    authenticate,
    isAdmin,
    param('idUser').isNumeric().withMessage('Id must be a number'),
    handleInputErrors,
    AuthController.getUserById
)

// check password
router.post('/check-password',
    authenticate,
    body('password')
        .notEmpty().withMessage('Password is required'),
    handleInputErrors,
    AuthController.checkPassword
)


export default router;