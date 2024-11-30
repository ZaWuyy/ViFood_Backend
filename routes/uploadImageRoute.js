import express from 'express';
import { uploadImage, uploadImages, getImageUrl, deleteImage, updateImage } from '../controllers/uploadImageController.js';

const router = express.Router();

// Route để upload một ảnh đơn
router.post('/upload', uploadImage);

// Route để upload nhiều ảnh
router.post('/upload-multiple', uploadImages);

// Route để lấy URL ảnh theo publicId
router.get('/image/:publicId', (req, res) => {
  const imageUrl = getImageUrl(req.params.publicId);
  res.status(200).json({ imageUrl });
});

// Route để xóa ảnh theo publicId
router.delete('/image/:publicId', async (req, res) => {
  try {
    await deleteImage(req.params.publicId);
    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: `Failed to delete image: ${error.message}` });
  }
})

// Route để cập nhật ảnh
router.put('/image', updateImage);

export default router;
