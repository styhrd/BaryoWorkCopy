import express from 'express'
import userAuth from '../middlewares/authMiddleware.js'
import { forgotpassController, getUserController, postUserController, resetpassController, updateUserController } from '../controller/userController.js'


//router object

const router = express.Router()


//routes


//GET USER by id
router.get("/get-user/:userId", userAuth, getUserController)

//UPDATE USER
router.put("/update-user", userAuth, updateUserController)

router.post("/post-user", userAuth, postUserController)

router.post("/forgotpass", forgotpassController)

router.post("/reset-password/:id/:token", resetpassController)
export default router