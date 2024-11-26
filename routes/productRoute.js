import express from 'express';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
} from '../controllers/productController.js';

const router = express.Router();

// Lấy danh sách tất cả products
router.get('/', getProducts);

// Lấy thông tin product theo ID
router.get('/:id', getProductById);

// Tạo mới product
router.post('/create', createProduct);

// Cập nhật product theo ID
router.put('/update/:id', updateProduct);

// Xóa product theo ID
router.delete('/delete/:id', deleteProduct);

export default router;
