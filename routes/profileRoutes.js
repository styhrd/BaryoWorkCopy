import express from 'express'
import userAuth from '../middlewares/authMiddleware.js'
import { createProfileController, getProfileController, updateProfileController } from '../controller/profileController.js'
import upload from '../middlewares/multerMiddleware.js'
import multer from 'multer'



const router = express.Router()



router.post('/create-profile', userAuth, upload, createProfileController)

router.patch("/update-profile/:profileId", userAuth, upload, updateProfileController);

router.get("/get-profile", userAuth, getProfileController);

export default router