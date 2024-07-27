import express from 'express';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import colors from 'colors';
import testRoutes from './routes/testRoutes.js'
import cors from 'cors'
import morgan from 'morgan'
import authRoutes from './routes/authRoutes.js'
import errorMiddleware from './middlewares/errorMiddleware.js';
import 'express-async-errors'
import userRoutes from './routes/userRoutes.js'
import jobsRoutes from './routes/jobsRoutes.js'
import profileRoutes from './routes/profileRoutes.js'
import educRoutes from './routes/educRoutes.js'
import expRoutes from './routes/expRoutes.js'
import imageRoutes from './routes/imageRoutes.js'
import applyRoutes from './routes/applyRoutes.js'
//restobject
const app = express();

//middlewares
//nate testing
//testbranch
//BryTesting
//kylefttesting
//lyratesting
//test
app.use(express.json())
app.use(cors())
app.use(morgan('dev'))

dotenv.config()

connectDB();

//ROUTES
app.use('/api/v1/test', testRoutes)
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/user', userRoutes)
app.use('/api/v1/job', jobsRoutes)
app.use('/api/v1/profile', profileRoutes)
app.use('/api/v1/education', educRoutes)
app.use('/api/v1/experience', expRoutes)
app.use('/api/v1/image', imageRoutes)
app.use('/api/v1/apply', applyRoutes)

//validateion middleware
app.use(errorMiddleware)

//port

const PORT = process.env.PORT || 8080
const DEV_MODE = process.env.DEV_MODE

//listen

app.listen(8080, () => {
    console.log(`Node Server is ALREADY Running ${DEV_MODE} on port number ${PORT}`.bgCyan.white)
})