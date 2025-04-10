import User from "../models/User";
import { Request, Response } from 'express';
import { hashPassword } from "../utils/auth";
// import { generateToken } from "../utils/token";
import { comparePassword } from "../utils/auth";
import { generateToken } from "../utils/token";
import { generateJWT } from "../utils/jwt";
import { Op } from 'sequelize';



export class AuthController {
    static createAccount = async (req: Request, res: Response) => {

        const { email, password } = req.body;

        //checl if the user already exists
        try {

            const emailExists = await User.findOne({ where: { email } })
            if (emailExists) {
                const error = new Error('El correo electrónico ya está en uso')
                res.status(409).json({ error: error.message })
                return;
            }

            const user = await User.create(req.body)
            user.password = await hashPassword(password)

            await user.save()
            res.status(201).json("Usuario creado con éxito")
        } catch (error) {
            // console.log(error)
            res.status(500).json({ error: 'Error creando el usuario' })
            return;
        }
    }

    

    static login = async (req: Request, res: Response) => {
        const { email, password } = req.body

        try {
            const user = await User.findOne({ where: { email } })
            if (!user) {
                const error = new Error('Usuario no encontrado')
                res.status(404).json({ error: error.message })
                return;
            }

            //check if the password is correct
            const isPasswordValid = await comparePassword(password, user.password)
            if (!isPasswordValid) {
                const error = new Error('Contraseña incorrecta')
                res.status(401).json({ error: error.message })
                return;
            }

            //generate token
            const token = generateJWT(user.id)
            res.send(token)
        } catch (error) {
            // console.log(error)
            res.status(500).json({ error: 'Error logging in' })
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
        const offset = parseInt(req.query.offset as string) || 1
        const offsetCalc = (offset - 1) * limit

        try {
            const users = await User.findAndCountAll({
                attributes: ["id", "name", "email", "phone", "role"],
                where: { role: "paciente" },
                limit,
                offset: offsetCalc,
                order: [["createdAt", "DESC"]]
            })
            res.json({
                users: users.rows,
                total: users.count,
                totalPages: Math.ceil(users.count / limit),
                currentPage: offset
            })
        } catch (error) {
            res.status(500).json({ error: 'Error getting users' })
        }
    }

    static searchUsers = async (req: Request, res: Response) => {
        const { name } = req.query

        console.log(name)

        try {
            const users = await User.findAll({
                attributes: ["id", "name", "email", "phone"],
                where: {
                    // Búsqueda por nombre, email o teléfono, con insensibilidad a mayúsculas/minúsculas
                    [Op.or]: [
                        {
                            name: {
                                [Op.iLike]: `%${name}%`  // `iLike` es insensible a mayúsculas/minúsculas
                            }
                        },
                        {
                            email: {
                                [Op.iLike]: `%${name}%`
                            }
                        },
                        {
                            phone: {
                                [Op.iLike]: `%${name}%`
                            }
                        }
                    ]
                }
            });
            res.json(users)
        } catch (error) {
            res.status(500).json({ error: 'Error searching users' })
        }
    }

    static updateProfile = async (req: Request, res: Response) => {

        try {
            const isAdmin = req.user.role === 'admin'
            if (!isAdmin) {
                res.status(403).json({ error: 'No autorizado' })
                return;
            }

            const { idUser } = req.params
            const { name, email, phone } = req.body

            // check if the user exists
            const user = await User.findByPk(idUser
                , {
                    attributes: ["id", "name", "email", "phone", "role"]
                }
            )
            if (!user) {
                res.status(404).json({ error: 'User not found' })
                return;
            }

            const emailExists = await User.findOne({ where: { email } })
            if (emailExists && emailExists.id !== user.id) {
                res.status(409).json({ error: 'Email already in use' })
                return;
            }

            await user.update({
                name: name || user.name,
                email: email || user.email,
                phone: phone || user.phone
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
                res.status(403).json({ error: 'No autorizado' })
            }

            const { idUser } = req.params

            // check if the user exists
            const user = await User.findByPk(idUser)
            if (!user) {
                res.status(404).json({ error: 'User not found' })
            }

            await user.destroy()
            res.json({ message: 'User deleted' })

        } catch (error) {
            // console.log(error)
            res.status(500).json({ error: 'Error deleting user' })
        }
    }
}