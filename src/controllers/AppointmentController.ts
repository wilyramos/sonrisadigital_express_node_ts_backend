import { Request, Response } from 'express';
import Appointment from '../models/Appointment';
import Medic from '../models/Medic';
import User from '../models/User';
import { Op, fn, col, literal } from 'sequelize';
import { startOfWeek, endOfWeek } from 'date-fns';



export class AppointmentController {
    static createAppointment = async (req: Request, res: Response) => {

        try {
            const { medicId, patientId, date, description } = req.body


            // check if the medic exists
            const medic = await Medic.findByPk(medicId)
            if (!medic) {
                res.status(404).json({ error: 'Medico no encontrado' })
                return;
            }

            // check if the patient exists
            const patient = await User.findByPk(patientId)
            if (!patient) {
                res.status(404).json({ error: 'Paciente no encontrado' })
                return;
            }

            // check if the appointment is available
            const appointmentExists = await Appointment.findOne({
                where: {
                    medicId,
                    date,
                    status: {
                        [Op.ne]: 'cancelled'
                    }

                }
            })

            if (appointmentExists) {
                res.status(409).json({ error: 'La cita ya está ocupada' })
                return;
            }

            // create the appointment
            const appointment = await Appointment.create({
                medicId,
                patientId,
                date,
                description,
                status: 'pending'
            })

            res.status(201).json("Cita creada con éxito")

        } catch (error) {
            // console.log(error)
            res.status(500).json({ error: 'Error creating appointment' })
            return;
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

    static updateStatusAppointment = async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const { status } = req.body
            const appointment = await Appointment.findByPk(id)
            if (!appointment) {
                res.status(404).json({ error: 'Cita no encontrada' })
                return;
            }

            await appointment.update({
                status
            })

            res.json("Cita actualizada con éxito")

        } catch (error) {
            // console.log(error)
            res.status(500).json({ error: 'Error al actualizar el estado de la cita' })
            return;
        }
    }

    static getAppointmentsByPatient = async (req: Request, res: Response) => {
        try {
            const { patientId } = req.params
            // check if the patient exists
            const patient = await User.findByPk(patientId)
            if (!patient) {
                res.status(404).json({ message: 'Paciente no encontrado' })
                return;
            }

            const appointments = await Appointment.findAll({
                where: {
                    patientId
                },
                include: [
                    {
                        model: Medic,
                        as: 'medic',
                        attributes: ['id', 'name', 'speciality', 'email', 'phone']
                    }
                ]
            })
            res.json(appointments)
        } catch (error) {
            // console.log(error)
            res.status(500).json({ error: 'Error searching appointments' })
        }
    }

    static getAppointmentsByPatientDNI = async (req: Request, res: Response) => {
        try {
            const { dni } = req.params

            // check if the dni is valid
            // check if the patient exists and not return the password
            const patient = await User.findOne({
                where: {
                    dni
                },
                attributes: ['id', 'name', 'email', 'phone', 'dni', 'role']
            })

            if (!patient) {
                res.status(404).json({ message: 'Paciente no encontrado' })
                return;
            }

            const appointments = await Appointment.findAll({
                where: {
                    patientId: patient.id
                },
                include: [
                    {
                        model: Medic,
                        as: 'medic',
                        attributes: ['id', 'name', 'speciality', 'email', 'phone']
                    }
                ]
            })
            res.json({
                patient,
                appointments,
            })

        } catch (error) {
            // console.log(error)
            res.status(500).json({ message: 'Error searching appointments' })
            return;
        }
    }

    static getAppointmentsByMedic = async (req: Request, res: Response) => {
        try {
            const { medicId } = req.params
            // check if the medic exists
            const medic = await Medic.findByPk(medicId)
            if (!medic) {
                res.status(404).json({ message: 'Medico no encontrado' })
                return;
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

    static getAppointments = async (req: Request, res: Response) => {
        try {

            // get limit and offset from query params
            const { limit = 10, offset = 0 } = req.query
            const appointments = await Appointment.findAll({
                include: [
                    {
                        model: Medic,
                        as: 'medic',
                        attributes: ['id', 'name', 'speciality', 'email', 'phone']
                    },
                    {
                        model: User,
                        as: 'patient',
                        attributes: ['id', 'name', 'email', 'phone']
                    }
                ],
                limit: Number(limit),// limit the number of results
            })
            res.json(appointments)
        } catch (error) {
            // console.log(error)
            res.status(500).json({ error: 'Error searching appointments' })
        }
    }

    static getAppointmentsWithPagination = async (req: Request, res: Response) => {
        try {

            // get limit and offset f rom query params
            const limit = parseInt(req.query.limit as string) || 10
            const page = parseInt(req.query.page as string) || 1
            const offset = (page - 1) * limit // Salto
            const query = req.query.query as string || ""
            const where: any = {};

            if (query) {
                where[Op.or] = [
                    { description: { [Op.iLike]: `%${query}%` } },
                    { '$medic.name$': { [Op.iLike]: `%${query}%` } }, 
                    { '$patient.name$': { [Op.iLike]: `%${query}%` } }, 
                    { '$medic.email$': { [Op.iLike]: `%${query}%` } }, 
                ]
            }

            const appointments = await Appointment.findAndCountAll({
                include: [
                    {
                        model: Medic,
                        as: 'medic',
                        attributes: ['id', 'name', 'speciality', 'email', 'phone']
                    },
                    {
                        model: User,
                        as: 'patient',
                        attributes: ['id', 'name', 'email', 'phone']
                    }
                ],
                where: { ...where },
                limit,
                offset
                
            })
            res.json({
                appointments: appointments.rows,
                total: appointments.count,
                totalPages: Math.ceil(appointments.count / limit),
                currentPage: page
            })

        } catch (error) {
            // console.log(error)
            res.status(500).json({ error: 'Error searching appointments' })
        }
    }

    static getAppointmentByDate = async (req: Request, res: Response) => {
        try {
            const { date } = req.params
            console.log(date)
            // check if the date is valid
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/
            if (!dateRegex.test(date)) {
                res.status(400).json({ error: 'Invalid date format. Expected format: YYYY-MM-DD' })
                return;
            }

            const startDate = new Date(date)
            const endDate = new Date(date)
            endDate.setDate(endDate.getDate() + 1)

            const appointments = await Appointment.findAll({
                where: {
                    date: {
                        [Op.gte]: startDate,
                        [Op.lt]: endDate
                    }
                },
                include: [
                    {
                        model: Medic,
                        as: 'medic',
                        attributes: ['id', 'name', 'speciality', 'email', 'phone']
                    },
                    {
                        model: User,
                        as: 'patient',
                        attributes: ['id', 'name', 'email', 'phone']
                    }
                ]
            })
            res.json(appointments)
        } catch (error) {
            // console.log(error)
            res.status(500).json({ error: 'Error searching appointments' })
        }
    }

    static getAppointmentById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const appointment = await Appointment.findByPk(id, {
                include: [
                    {
                        model: Medic,
                        as: 'medic',
                        attributes: ['id', 'name', 'speciality', 'email', 'phone']
                    },
                    {
                        model: User,
                        as: 'patient',
                        attributes: ['id', 'name', 'email', 'phone']
                    }
                ]
            })
            if (!appointment) {
                res.status(404).json({ error: 'Appointment not found' })
                return;
            }
            res.json(appointment)
        } catch (error) {
            // console.log(error)
            res.status(500).json({ error: 'Error searching appointment' })
        }
    }

    static getAppointmentsBySearch = async (req: Request, res: Response) => {
        try {
            const { query } = req.query;

            if (!query) {
                res.status(400).json({ error: 'Query is required' });
                return;
            }

            // Create a flexible where condition
            const whereCondition: any = {
                [Op.or]: [
                    { description: { [Op.like]: `%${query}%` } },
                ]
            };

            // Define the include options to join related models
            const includeOptions: any[] = [
                {
                    model: Medic,
                    as: 'medic',
                    attributes: ['id', 'name', 'speciality', 'email', 'phone'],
                    required: false
                },
                {
                    model: User,
                    as: 'patient',
                    attributes: ['id', 'name', 'email', 'phone'],
                    required: false
                },
            ];

            whereCondition[Op.or].push(
                { '$medic.name$': { [Op.iLike]: `%${query}%` } }, // Using iLike for case-insensitivity (PostgreSQL)
                { '$patient.name$': { [Op.iLike]: `%${query}%` } } // Using iLike for case-insensitivity (PostgreSQL)
            );

            const citas = await Appointment.findAll({
                where: whereCondition,
                include: includeOptions, // <--- Add the include options here
                order: [['date', 'ASC']],
                limit: 10,
            });

            if (citas.length === 0) {
                res.status(404).json({ error: 'No se encontraron citas' });
                return;
            }

            res.json(citas);

        } catch (error) {
            console.error('Error searching appointments:', error); // Log the actual error for debugging
            res.status(500).json({ message: 'Error searching appointments' });
        }
    };

    static deleteAppointment = async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const appointment = await Appointment.findByPk(id)
            if (!appointment) {
                res.status(404).json({ message: 'Cita no encontrada' })
                return;
            }

            await appointment.destroy();

            res.json({ message: "Cita eliminada con éxito" });

        } catch (error) {
            // console.error('Error deleting appointment:', error);
            res.status(500).json({ message: 'Error al eliminar la cita' });
        }
    }

    static getAppointmentsReportWeekly = async (req: Request, res: Response) => {
        try {
            const startOfCurrentWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
            const endOfCurrentWeek = endOfWeek(new Date(), { weekStartsOn: 1 });

            const citas = await Appointment.findAll({
                attributes: [
                    [fn('to_char', col('date'), 'Day'), 'dayName'],
                    [fn('count', '*'), 'count'],
                    [fn('extract', literal('dow from date')), 'dayOfWeek']
                ],
                where: {
                    date: {
                        [Op.between]: [startOfCurrentWeek, endOfCurrentWeek]
                    }
                },
                group: ['dayOfWeek', 'dayName'],
                order: [[fn('extract', literal('dow from date')), 'ASC']]
            });

            const diccionary = {
                0: 'Domingo',
                1: 'Lunes',
                2: 'Martes',
                3: 'Miércoles',
                4: 'Jueves',
                5: 'Viernes',
                6: 'Sábado',
            };

            // Format the result to include the day name and count
            const formattedCitas = citas.map((cita: any) => ({
                name: diccionary[cita.getDataValue('dayOfWeek')],
                citas: parseInt(cita.getDataValue('count'), 10) || 0, // Default to 0 if count is null
            }));

            res.json(formattedCitas);

        } catch (error) {
            // console.log(error)
            res.status(500).json({ message: 'Error al obtener citas de la semana' })
        }
    }

    static getAppointmentsReportLastYear = async (req: Request, res: Response) => {
        try {
            const startOfCurrentYear = new Date(new Date().getFullYear(), 0, 1);
            const endOfCurrentYear = new Date(new Date().getFullYear(), 11, 31);

            console.log("start", startOfCurrentYear, "end", endOfCurrentYear)

            const citas = await Appointment.findAll({
                attributes: [
                    [fn('to_char', col('date'), 'Month'), 'monthName'],
                    [fn('count', '*'), 'count'],
                    [fn('extract', literal('month from date')), 'month']
                ],
                where: {
                    date: {
                        [Op.between]: [startOfCurrentYear, endOfCurrentYear]
                    }
                },
                group: ['month', 'monthName'],
                order: [[fn('extract', literal('month from date')), 'ASC']]
            });

            const diccionary = {
                1: 'Enero',
                2: 'Febrero',
                3: 'Marzo',
                4: 'Abril',
                5: 'Mayo',
                6: 'Junio',
                7: 'Julio',
                8: 'Agosto',
                9: 'Septiembre',
                10: 'Octubre',
                11: 'Noviembre',
                12: 'Diciembre'
            };

            // Format the result to include the month name and count
            const formattedCitas = citas.map((cita: any) => ({
                name: diccionary[cita.getDataValue('month')],
                citas: parseInt(cita.getDataValue('count'), 10) || 0, // Default to 0 if count is null
            }));

            res.json(formattedCitas);

        } catch (error) {
            // console.log(error)
            res.status(500).json({ message: 'Error al obtener citas del mes' })
        }
    }
}