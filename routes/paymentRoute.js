import express from 'express';
import { requestPayment, paymentReturn, getPaymentHistory } from '../controllers/paymentController';
import { verifyToken } from '../middleware/auth.js';
const router = express.Router();

// Route để yêu cầu thanh toán VNPay
router.post('/create-payment', verifyToken,requestPayment);

// Route để VNPay trả về kết quả thanh toán
router.get('/payment-return', verifyToken, paymentReturn);

router.get('/payment-history', verifyToken, getPaymentHistory);

export default router;

