import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"
import User from "../models/User"

declare global {
    namespace Express {
        interface Request {
            user: User
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const bearer = req.headers.authorization
    if (!bearer) {
        res.status(401).json({ error: 'Unauthorized' })
    }
    const token = bearer.split(' ')[1]
    if (!token) {
        res.status(401).json({ error: 'Unauthorized' })
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if( typeof decoded ==="object" && decoded.id){
            req.user = await User.findByPk(decoded.id, {
                attributes: ["id", "name", "email", "phone", "role"]
            })
            next()
        }
        
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' })
    }
}

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.user.role === 'admin') {
        next()
    } else {
        res.status(403).json({ error: 'Unauthorized' })
    }
}