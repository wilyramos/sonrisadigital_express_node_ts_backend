import { Router } from "express";
import MedicalRecord from "../models/MedicalRecord";
import { MedicalRecordController } from "../controllers/MedicalRecordController";


const router = Router();

router.post('/create',


    MedicalRecordController.createMedicRecord
)

router.get('/:userId',
    MedicalRecordController.getMedicalRecordsByUser
)
router.get('/:userId/download',
    MedicalRecordController.downloadMedicalHistoryPDF
)




export default router;