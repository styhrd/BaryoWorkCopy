import express from 'express'
import userAuth from '../middlewares/authMiddleware.js'
import { deleteEducationController, createEducationController, getEducationByIdController, UpdateEducationController } from '../controller/educController.js'


const router = express.Router()


router.post('/create-educ', userAuth, createEducationController)
router.get('/get-educ/:id', userAuth, getEducationByIdController)
router.patch('/update-educ/:id', userAuth, UpdateEducationController)
router.delete('/delete-educ/:userId', userAuth, deleteEducationController)

export default router