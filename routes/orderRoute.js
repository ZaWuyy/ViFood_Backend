// routes/orderRoute.js
import express from 'express';
import {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from '../controllers/orderController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Create Order
router.post('/', verifyToken, createOrder);

// Get All Orders (Admin)
router.get('/', verifyToken, getAllOrders);

// Get Orders by User
router.get('/user', verifyToken, getUserOrders);

// Get Order by ID
router.get('/:id', verifyToken, getOrderById);

// Update Order Status
router.patch('/:id/status', verifyToken, updateOrderStatus);

//  Delete Order
router.delete('/:id', verifyToken, deleteOrder);

export default router;