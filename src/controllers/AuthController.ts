import User from "../models/User";
import { Request, Response } from 'express';
import { hashPassword } from "../utils/auth";
// import { generateToken } from "../utils/token";
import { comparePassword } from "../utils/auth";
// import { generateToken } from "../utils/token";
import { generateJWT } from "../utils/jwt";
import { Op } from 'sequelize';



export class AuthController {
    static createAccount = async (req: Request, res: Response) => {

        const { email, password } = req.body;

        //check if the user already exists
        try {

            const emailExists = await User.findOne({ where: { email } })
            if (emailExists) {
                res.status(409).json({ message: 'El correo electrónico ya está en uso' })
                return;
            }

            const user = await User.create(req.body)
            user.password = await hashPassword(password)

            await user.save()
            res.status(201).json({ message: "Usuario creado con éxito" })
        } catch (error) {
            // console.log(error)
            res.status(500).json({ message: 'Error creando el usuario' })
            return;
        }
    }

    static createUserByAdmin = async (req: Request, res: Response) => {
        const { email, dni } = req.body;

        //checl if the user already exists
        try {
            const emailExists = await User.findOne({ where: { email } })
            if (emailExists) {
                res.status(409).json({ message: 'El correo electrónico ya está en uso' })
                return;
            }

            const dniExists = await User.findOne({ where: { dni } })
            if (dniExists) {
                res.status(409).json({ message: 'El DNI ya está en uso' })
                return;
            }


            const role = req.body.role || 'paciente'
            // the email will be the same as the password
            const password = email
            const hashedPassword = await hashPassword(password)
            const user = await User.create({
                ...req.body,
                password: hashedPassword,
                role
            })

            await user.save()

            res.status(201).json({ message: "Usuario creado con éxito" })
        } catch (error) {
            // console.log(error)
            res.status(500).json({ message: 'Error creando el usuario' })
            return;
        }
    }

    static login = async (req: Request, res: Response) => {
        const { email, password } = req.body

        try {
            const user = await User.findOne({ where: { email } })
            if (!user) {
                res.status(404).json({ message: 'Usuario no encontrado' })
                return;
            }

            //check if the password is correct
            const isPasswordValid = await comparePassword(password, user.password)
            if (!isPasswordValid) {
                res.status(401).json({ message: 'Contraseña incorrecta' })
                return;
            }

            //generate token
            const token = generateJWT(user.id)
            res.send(token)
        } catch (error) {
            // console.log(error)
            res.status(500).json({ message: 'Error iniciando sesión' })
            return;
        }
    }

    static user = async (req: Request, res: Response) => {
        res.json(req.user)
    }

    // static getUsers = async (req: Request, res: Response) => {
    //     try {
    //         const users = await User.findAll({
    //             attributes: ["id", "name", "email", "phone"],
    //             // where: { role: "paciente"}
    //         })
    //         res.json(users)
    //     } catch (error) {
    //         res.status(500).json({ error: 'Error getting users' })
    //     }
    // }

    static getUsers = async (req: Request, res: Response) => {

        const limit = parseInt(req.query.limit as string) || 10
        const page = parseInt(req.query.page as string) || 1
        const offset = (page - 1) * limit // Salto
        const query = req.query.query as string || ""
        const where: any = {};
        
        if(query) {
            where[Op.or] = [
                {name: {[Op.iLike]: `%${query}%`}},
                {email: {[Op.iLike]: `%${query}%`}},
                {phone: {[Op.iLike]: `%${query}%`}},
                {dni: {[Op.iLike]: `%${query}%`}}
            ]
        }
        try {
            const users = await User.findAndCountAll({
                attributes: ["id", "name", "email", "phone", "role", "dni"],
                where: { role: "paciente", ...where },
                limit,
                offset,
                order: [["createdAt", "DESC"]]
            })
            res.json({
                users: users.rows,
                total: users.count,
                totalPages: Math.ceil(users.count / limit),
                currentPage: page
            })
        } catch (error) {
            res.status(500).json({ message: 'Error getting users' })
        }
    }

    static searchUsers = async (req: Request, res: Response) => {
        const { query } = req.query
        console.log(query)

        try {
            // check if the user exists
            if (!query) {
                res.status(400).json({ error: 'Query is required' })
                return;
            }

            const users = await User.findAll({
                attributes: ["id", "name", "email", "phone", "role", "dni"],
                where: {[Op.or]: [
                        {name: {[Op.iLike]: `%${query}%`}},
                        {email: {[Op.iLike]: `%${query}%`}},
                        {phone: {[Op.iLike]: `%${query}%`}},
                        {dni: {[Op.iLike]: `%${query}%`}}
                    ],
                    role: "paciente"
                },
                order: [["name", "ASC"]],
                limit: 10,
            });
            res.json(users)
        } catch (error) {
            res.status(500).json({ error: 'Error searching users' })
            return;
        }
    }

    static updateUser = async (req: Request, res: Response) => {
        try {

            const { idUser } = req.params
            const { name, email, phone, dni } = req.body

            // check if the user exists
            const user = await User.findByPk(idUser)
            if (!user) {
                res.status(404).json({ message: 'User not found' })
                return;
            }

            const emailExists = await User.findOne({ where: { email } })
            if (emailExists && emailExists.id !== user.id) {
                res.status(409).json({ message: 'Email already in use' })
                return;
            }
            const dniExists = await User.findOne({ where: { dni } })
            if (dniExists && dniExists.id !== user.id) {
                res.status(409).json({ message: 'DNI already in use' })
                return;
            }

            await user.update({
                name: name || user.name,
                email: email || user.email,
                phone: phone || user.phone,
                dni: dni || user.dni
            })

            res.json({ message: 'Profile updated' })

        } catch (error) {
            // console.log(error)
            res.status(500).json({ error: 'Error updating profile' })
        }
    }

    static deleteUser = async (req: Request, res: Response) => {
        try {
            const isAdmin = req.user.role === 'admin'
            if (!isAdmin) {
                res.status(403).json({ message: 'No autorizado' })
                return;
            }

            const { idUser } = req.params

            // check if the user exists
            const user = await User.findByPk(idUser)
            if (!user) {
                res.status(404).json({ message: 'User not found' })
                return;
            }

            await user.destroy()
            res.json({ message: 'User deleted' })

        } catch (error) {
            // console.log(error)
            res.status(500).json({ message: 'Error deleting user' })
        }
    }

    static getUserById = async (req: Request, res: Response) => {
        try {
            const isAdmin = req.user.role === 'admin'
            if (!isAdmin) {
                res.status(403).json({ message: 'No autorizado' })
                return;
            }

            const { idUser } = req.params

            // check if the user exists
            const user = await User.findByPk(idUser, {
                attributes: ["id", "name", "email", "phone", "role", "dni"]
            })
            if (!user) {
                res.status(404).json({ message: 'User not found' })
                return;
            }

            res.json(user)

        } catch (error) {
            // console.log(error)
            res.status(500).json({ message: 'Error getting user' })
        }
    }

    static checkPassword = async (req: Request, res: Response) => {
        const { password } = req.body

        try {
            const user = await User.findByPk(req.user.id)
            const isPasswordValid = await comparePassword(password, user.password)
            if (!isPasswordValid) {
                res.status(401).json({ message: 'Contraseña incorrecta' })
                return;
            }
            res.json({ message: 'Contraseña correcta' })
        } catch (error) {
            // console.log(error)
            res.status(500).json({ message: 'Error verificando la contraseña' })
        }
    }

    static getUserByDNI = async (req: Request, res: Response) => {
        try {
            const { dni } = req.params

            // check if the user exists
            const user = await User.findOne({
                where: { dni },
                attributes: ["id", "name", "email", "phone", "role", "dni"]
            })

            if (!user) {
                res.status(404).json({ message: 'User not found' })
                return;
            }

            res.json(user)

        } catch (error) {
            // console.log(error)
            res.status(500).json({ message: 'Error getting user' })
        }
    }
}