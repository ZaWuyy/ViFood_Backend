// routes/orderDetailRoute.js
import express from 'express';
import {
  createOrderDetail,
  getAllOrderDetails,
  getOrderDetailById,
  updateOrderDetail,
  deleteOrderDetail,
} from '../controllers/orderDetailController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// create order detail
router.post('/', verifyToken, createOrderDetail);

// get all order details
router.get('/', verifyToken, getAllOrderDetails);

// get order detail by id
router.get('/:id', verifyToken, getOrderDetailById);

// update order detail
router.patch('/:id', verifyToken, updateOrderDetail);

// delete order detail
router.delete('/:id', verifyToken, deleteOrderDetail);

export default router;