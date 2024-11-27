import express from 'express';
import { uploadImage, uploadImages, getImageUrl, deleteImage, updateImage } from '../controllers/uploadImageController.js';

const router = express.Router();

// Route to upload an image
router.post('/upload', uploadImage, (req, res) => {
  res.status(200).json({ message: 'Image uploaded successfully', imageUrl: req.file.path });
});

// Route to upload multiple images
router.post('/upload-multiple', uploadImages, (req, res) => {
  res.status(200).json({ message: 'Images uploaded successfully', imageUrls: req.files.map(file => file.path) });
});

// Route to get an image URL
router.get('/image/:publicId', (req, res) => {
  const imageUrl = getImageUrl(req.params.publicId);
  res.status(200).json({ imageUrl });
});

// Route to delete an image
router.delete('/image/:publicId', async (req, res) => {
  try {
    await deleteImage(req.params.publicId);
    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: `Failed to delete image: ${error.message}` });
  }
});

// Route to update an image
router.put('/image', updateImage);

export default router;