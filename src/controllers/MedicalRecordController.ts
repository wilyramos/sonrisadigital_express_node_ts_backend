import { Request, Response } from "express";
import MedicalRecord from "../models/MedicalRecord";
import User from "../models/User";
import PDFdocument from "pdfkit";


export class MedicalRecordController {

    // Create a new medical record
    static createMedicRecord = async (req: Request, res: Response) => {

        const { userId, description } = req.body;

        try {
            const user = await User.findByPk(userId);
            if (!user) {
                res.status(404).json({ message: "User not found" });
            }
            const medicalRecord = await MedicalRecord.create({ description, userId });

            res.status(201).json(medicalRecord);
            
        } catch (error) {
            // console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    // Get medical records by user
    static getMedicalRecordsByUser = async (req: Request, res: Response) => {
        const { userId } = req.params;

        try {
            const user = await User.findByPk(userId, {
                include: MedicalRecord
            });
            if (!user) {
                res.status(404).json({ message: "User not found" });
            }
            res.json(user.medicalRecords);
        } catch (error) {
            // console.error(error);
            res.status(500).json({ message: "Internal server error "});
        }
    }

    static downloadMedicalHistoryPDF = async (req: Request, res: Response) => {
        const { userId } = req.params;

        try {
            const user = await User.findByPk(userId, {
                include: MedicalRecord
            });    
            
            if (!user) {
                res.status(404).json({ message: "User not found" });
            }

            // Create a PDF with the medical history

            const doc = new PDFdocument();

            // setting the response header
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=${user.name}_medical_history.pdf`);

            // Pipe the PDF into the response
            doc.pipe(res);

            // Add the user name to the PDF
            doc.fontSize(20).text(`Medical history for ${user.name}`);

            // Add the medical records to the PDF
            user.medicalRecords.forEach((record, index) => {
                doc.fontSize(14).text(`${index + 1}. ${record.description}`);
                doc.fontSize(10).text(`Created at: ${record.createdAt}`);
            });

            // Finalize the PDF
            doc.end();
        } catch (error) {
            res.status(500).json({ message: "Error generating PDF" });
        }
    }
}