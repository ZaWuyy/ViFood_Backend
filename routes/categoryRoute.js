import express from 'express';
import { uploadImage } from '../controllers/uploadImageController.js'; // Import the uploadImage middleware
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { verifyToken } from '../middleware/auth.js';
const router = express.Router();

// Lấy danh sách categories
router.get('/', getCategories);

// Tạo mới category (hỗ trợ upload ảnh)
router.post('/', uploadImage, verifyToken,createCategory); // Chỉ cho phép upload một ảnh

// Cập nhật category (hỗ trợ upload ảnh)
router.put('/:id', uploadImage, verifyToken,updateCategory);

// Xóa category
router.delete('/:id', verifyToken, deleteCategory);

export default router;