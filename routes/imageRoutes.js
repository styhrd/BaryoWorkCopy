import express from 'express';
import userAuth from '../middlewares/authMiddleware.js';
import { uploadImageController, getImageByIdController } from '../controller/imagecontroller.js';
import upload from '../middlewares/multerMiddleware.js';

const router = express.Router();
router.post('/upload-image', userAuth, upload, uploadImageController)
router.get('/get-image/:imageId', getImageByIdController);

export default router;
