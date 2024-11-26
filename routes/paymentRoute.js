import express from 'express';
import { requestPayment, paymentReturn, getPaymentHistory } from '../controllers/paymentController';

const router = express.Router();

// Route để yêu cầu thanh toán VNPay
router.post('/create-payment', requestPayment);

// Route để VNPay trả về kết quả thanh toán
router.get('/payment-return', paymentReturn);

router.get('/payment-history', getPaymentHistory);

export default router;

