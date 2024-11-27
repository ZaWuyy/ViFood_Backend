// productVariantRoute.js
import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  getProductVariants,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
} from '../controllers/productVariantController.js';
import { uploadImages } from '../controllers/uploadImageController.js';

const router = express.Router();

// Get Product Variants
router.get('/', verifyToken, getProductVariants);

// Create New Product Variant
router.post('/', verifyToken, uploadImages, createProductVariant);

// Update Product Variant
router.put('/:id', verifyToken, uploadImages, updateProductVariant);

// Delete Product Variant
router.delete('/:id', verifyToken, deleteProductVariant);

export default router;