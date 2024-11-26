// controllers/paymentController.js
import { createPayment, paymentReturn } from '../utils/paymentService';
import Payment from '../models/paymentModel';

export const requestPayment = async (req, res) => {
  try {
    const { orderId, discountCode } = req.body;
    
    // Tạo yêu cầu thanh toán VNPay
    const { vnpayUrl } = await createPayment(orderId, discountCode);
    
    // Chuyển hướng người dùng tới VNPay để thanh toán
    res.redirect(vnpayUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Payment request failed', error: error.message });
  }
};

export const paymentReturn = async (req, res) => {
  try {
    const { vnp_TxnRef, vnp_SecureHash } = req.query;

    // Kiểm tra mã hash trả về từ VNPay
    const isValid = verifyPaymentReturn(req.query);
    if (isValid) {
      // Lưu kết quả thanh toán vào database
      const payment = await Payment.findOne({ transaction_id: vnp_TxnRef });
      if (!payment) {
        throw new Error('Payment not found');
      }

      payment.status = 'success';
      await payment.save();
      
      res.redirect('/payment-success');
    } else {
      res.status(400).json({ message: 'Invalid payment response' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Payment return failed', error: error.message });
  }
};

// controllers/paymentController.js
export const getPaymentHistory = async (req, res) => {
    try {
      const payments = await Payment.find().populate('order');
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve payment history', error: error.message });
    }
  };
  
// Xác thực hash để đảm bảo tính toàn vẹn
const verifyPaymentReturn = (queryParams) => {
  const secureHash = queryParams.vnp_SecureHash;
  delete queryParams.vnp_SecureHash;
  const calculatedHash = generateVnpayHash(queryParams);
  return calculatedHash === secureHash;
};
