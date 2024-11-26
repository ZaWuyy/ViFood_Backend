import express from 'express';
import { upload } from '../config/multerConfig.js'; // Cấu hình multer cho file ảnh
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';

const router = express.Router();

// Lấy danh sách categories
router.get('/', getCategories);

// Tạo mới category (hỗ trợ upload ảnh)
router.post('/create', upload.single('image'), createCategory); // Chỉ cho phép upload một ảnh

// Cập nhật category (hỗ trợ upload ảnh)
router.put('/update/:id', upload.single('image'), updateCategory);

// Xóa category
router.delete('/delete/:id', deleteCategory);

export default router;
