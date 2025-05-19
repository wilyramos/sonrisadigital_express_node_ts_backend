import User from "../models/User";
import { Request, Response } from 'express';
import { hashPassword } from "../utils/auth";
// import { generateToken } from "../utils/token";
import { comparePassword } from "../utils/auth";
import { generateToken } from "../utils/token";
import { generateJWT } from "../utils/jwt";
import { Op } from 'sequelize';
import Medic from "../models/Medic";
import Schedule from "../models/Schedule";


export class MedicController {
    static createAccount = async (req: Request, res: Response) => {
        
        const { name, phone, speciality, email } = req.body;
        
        try {
            const emailExists = await User.findOne({ where: { email } })
            if (emailExists) {
                const error = new Error('El correo ya está en uso')
                res.status(409).json({ error: error.message })
                return;
            }

            await Medic.create(req.body)
            res.status(201).json("Medico creado correctamente")

        } catch (error) {   
            res.status(500).json({ error: 'Error creating account' })
        }
    }

    static getMedicById = async (req: Request, res: Response) => {
        try {
            const { medicId } = req.params
            const medic = await Medic.findOne({
                where: { id: medicId }
            })

            if (!medic) {
                res.status(404).json({ error: 'Medic not found' })
                return;
            }

            res.json(medic)
        } catch (error) {
            res.status(500).json({ error: 'Error getting medic' })
        }
    }

    static getMedics = async (req: Request, res: Response) => {
        try {
            const medics = await Medic.findAll()
            res.json(medics)
        } catch (error) {
            res.status(500).json({ error: 'Error getting medics' })
        }
    }

    static getMedicSchedule = async (req: Request, res: Response) => {
        try {
            const { medicId } = req.params
            const schedules = await Schedule.findAll({
                where: {
                    medicId
                }
            })

            if (schedules.length === 0) {
                res.status(404).json({ error: 'No hay horarios para este medico' })
            }

            res.json(schedules)

        } catch (error) {
            res.status(500).json({ error: 'Error getting schedule' })
        }

    }

    static searchMedics = async (req: Request, res: Response) => {
        const { query } = req.query
        // console.log(query)
        try {
            // check if the user exists
            if (!query) {
                res.status(400).json({ error: 'Query is required' })
                return;
            }       
            const medics = await Medic.findAll({
                attributes: ["id", "name", "phone", "email", "speciality"],
                where: {
                    [Op.or]: [
                        { name: { [Op.like]: `%${query}%` } },
                        { email: { [Op.like]: `%${query}%` } },
                        { speciality: { [Op.like]: `%${query}%` } },
                        { phone: { [Op.like]: `%${query}%` } },
                    ],
                },
                order: [["name", "ASC"]],
                limit: 10,
            })
            res.json(medics)
        } catch (error) {
            res.status(500).json({ error: 'Error searching users' })
            return;
        }
    }
    // static createSchedule = async (req: Request, res: Response) => {
}