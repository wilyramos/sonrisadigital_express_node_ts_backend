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
                const error = new Error('Email already in use')
                res.status(409).json({ error: error.message })
            }

            await Medic.create(req.body)
            res.status(201).json("Account created")

        } catch (error) {   
            res.status(500).json({ error: 'Error creating account' })
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

    // static createSchedule = async (req: Request, res: Response) => {

}