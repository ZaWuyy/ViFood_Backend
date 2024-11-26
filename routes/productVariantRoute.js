import express from 'express';
import {
  getProductVariants,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
} from '../controllers/productVariantController.js';
import { upload } from '../config/multerConfig.js';

const router = express.Router();

// Lấy danh sách variants
router.get('/', getProductVariants);

// Tạo product variant mới (hỗ trợ upload nhiều ảnh)
router.post('/create', upload.array('images', 5), createProductVariant); // Tối đa 5 ảnh

// Cập nhật product variant
router.put('/update/:id', upload.array('images', 5), updateProductVariant);

// Xóa product variant
router.delete('/delete/:id', deleteProductVariant);

export default router;
