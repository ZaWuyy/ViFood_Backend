import express from 'express';
import { uploadImage, deleteImage, updateImage } from '../controllers/uploadImageController.js';
import upload from '../config/multerConfig.js';

const router = express.Router();


router.post('/upload', upload.single('image'), uploadImage);


router.delete('/delete/:public_id', deleteImage);


router.put('/update/:public_id', upload.single('image'), updateImage);

export default router;
