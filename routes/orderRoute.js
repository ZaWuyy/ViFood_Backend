// routes/orderRoutes.js
import express from 'express';
import {createOrder, getOrder, getAllOrders} from '../controllers/orderController';

const router = express.Router();

// API tạo đơn hàng mới
router.post('/create', createOrder);

// API lấy thông tin đơn hàng
router.get('/:orderId', getOrder);

// API lấy tất cả đơn hàng của người dùng
router.get('/', getAllOrders);

export default router;
