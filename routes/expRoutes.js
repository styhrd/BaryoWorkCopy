import express from 'express'
import userAuth from '../middlewares/authMiddleware.js'
import { deleteExpController, createExpController, getExpByIdController, UpdateExperienceController } from '../controller/expController.js'


const router = express.Router()


router.post('/create-exp', userAuth, createExpController)
router.get('/get-exp/:id', userAuth, getExpByIdController);
router.patch('/update-exp/:id', userAuth, UpdateExperienceController)
router.delete('/delete-exp/:id', userAuth, deleteExpController)

export default router