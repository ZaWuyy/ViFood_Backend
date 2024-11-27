// productRoute.js
import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByUser,
} from '../controllers/productController.js';

const router = express.Router();

// **Public Routes**
router.get('/', getProducts);
router.get('/:id', getProductById);

// **Protected Routes**
router.post('/', verifyToken, createProduct);
router.put('/:id', verifyToken, updateProduct);
router.delete('/:id', verifyToken, deleteProduct);

// **User-Specific Routes**
router.get('/user/', verifyToken, getProductsByUser);

export default router;