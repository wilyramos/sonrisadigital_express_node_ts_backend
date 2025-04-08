import { Request, Response } from 'express';
import Appointment from '../models/Appointment';
import Medic from '../models/Medic';
import User from '../models/User';
import { Op } from 'sequelize';


export class AppointmentController {
    static createAppointment = async (req: Request, res: Response) => {

        try {
            const { medicId, patientId, date, description } = req.body
            // check if the medic exists
            const medic = await Medic.findByPk(medicId)
            if (!medic) {
                res.status(404).json({ error: 'Medic not found' })
            }

            // check if the patient exists
            const patient = await User.findByPk(patientId)
            if (!patient) {
                res.status(404).json({ error: 'Patient not found' })
            }


            // check if the appointment is available
            const appointmentExists = await Appointment.findOne({
                where: {
                    medicId,
                    date
                }
            })

            if (appointmentExists) {
                res.status(409).json({ error: 'Appointment already exists' })
            }

            // create the appointment
            const appointment = await Appointment.create({
                medicId,
                patientId,
                date,
                description,
                status: 'pending'
            })

            res.status(201).json(appointment)
            
        } catch (error) {
            // console.log(error)
            res.status(500).json({ error: 'Error creating appointment' })
        }
    }

    static cancelAppointment = async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const appointment = await Appointment.findByPk(id)
            if (!appointment) {
                res.status(404).json({ error: 'Appointment not found' })
            }

            if (appointment.status === 'cancelled') {
                res.status(409).json({ error: 'Appointment already cancelled' })
            }

            await appointment.update({
                status: 'cancelled'
            })

            res.json({ message: 'Appointment cancelled' })

        } catch (error) {
            // console.log(error)
            res.status(500).json({ error: 'Error cancelling appointment' })            
        }
    }

    static rescheduleAppointment = async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const { date } = req.body
            const appointment = await Appointment.findByPk(id)
            if (!appointment) {
                res.status(404).json({ error: 'Cita not found' })
            }

            if (appointment.status === 'cancelled') {
                res.status(409).json({ error: 'Cita cancelled' })
            }

            //TODO: Check if the medic is available

            const conflict = await Appointment.findOne({
                where: { medicId: appointment.medicId, date }
            })

            if (conflict) {
                res.status(409).json({ error: 'El médico ya tiene una cita programada para esa fecha' })
            }

            await appointment.update({
                date
            })

            res.json({ message: 'Appointment rescheduled' })

        } catch (error) {
            // console.log(error)
            res.status(500).json({ error: 'Error rescheduling appointment' })            
        }
    }

    static getAppointmentsByPatient = async (req: Request, res: Response) => {
        try {
            const { patientId } = req.params
            // check if the patient exists
            const patient = await User.findByPk(patientId)
            if (!patient) {
                res.status(404).json({ error: 'Patient not found' })
            }

            const appointments = await Appointment.findAll({
                where: {
                    patientId
                },
                include: [
                    {
                        model: Medic,
                        as: 'medic',
                        attributes: ['id', 'name']
                    }
                ]
            })
            res.json(appointments)
        } catch (error) {
            // console.log(error)
            res.status(500).json({ error: 'Error searching appointments' })            
        }
    }

    static getAppointmentsByMedic = async (req: Request, res: Response) => {
        try {
            const { medicId } = req.params
            // check if the medic exists
            const medic = await Medic.findByPk(medicId)
            if (!medic) {
                res.status(404).json({ error: 'Medic not found' })
            }

            const appointments = await Appointment.findAll({
                where: {
                    medicId
                },
                include: [
                    {
                        model: User,
                        as: 'patient',
                        attributes: ['id', 'name']
                    }
                ]
            })
            res.json(appointments)
        } catch (error) {
            // console.log(error)
            res.status(500).json({ error: 'Error searching appointments' })            
        }
    }

    
}