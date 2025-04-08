import express from 'express' 
import morgan from 'morgan'
import { db } from './config/db'
// import budgetRouter from './routes/budgetRouter'
import authRouter from './routes/authRouter'
import medicRouter from './routes/medicRouter'
import citaRouter from './routes/citaRouter'
import MedicalRecord from './routes/medicalRecord'

export async function connectDB () {
    try {
        await db.authenticate()
        db.sync()
        console.log('Conectado a la base de datos'.green)
    } catch (error) {
        console.log('Error al conectar a la base de datos'.red)
        // console.log(error)
    }
}
connectDB()

const app = express()
app.use(morgan('dev'))
app.use(express.json())

// app

// app.use("/api/budgets", budgetRouter)
app.use("/api/auth", authRouter)

// 
app.use("/api/medic", medicRouter)

// 
app.use("/api/cita", citaRouter)

//
app.use("/api/medicalrecord", MedicalRecord)

//supertest

app.use('/', (req, res) => {
    res.send('Hello World')    
})


export default app