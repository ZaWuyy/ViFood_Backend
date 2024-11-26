// services/paymentService.js
import Payment from '../models/paymentModel';
import { createVnpayPaymentRequest, verifyPaymentReturn } from './vnpayService';
import Order from '../models/orderModel';
import Voucher from '../models/voucherModel';


// Tạo thanh toán mới và yêu cầu thanh toán VNPay
export const createPayment = async (orderId, discountCode) => {
  // Lấy thông tin đơn hàng từ database
  const order = await Order.findById(orderId).populate('orderDetails');
  if (!order) {
    throw new Error('Order not found');
  }
  
  // Tính toán giảm giá từ voucher
  let discountAmount = 0;
  if (discountCode) {
    const voucher = await Voucher.findOne({ code: discountCode, status: 'active' });
    if (voucher) {
      // Kiểm tra xem voucher có còn hiệu lực không
      if (voucher.expiryDate > new Date() && voucher.quantity > 0) {
        // Tính số tiền giảm giá
        discountAmount = voucher.discountType === 'percentage'
          ? (order.total_amount * voucher.discount) / 100
          : voucher.discount;

        // Đảm bảo rằng số tiền giảm không vượt quá giới hạn của voucher
        if (voucher.maxDiscountAmount > 0) {
          discountAmount = Math.min(discountAmount, voucher.maxDiscountAmount);
        }
        
        // Giảm số lượng voucher
        voucher.quantity -= 1;
        await voucher.save();
      }
    }
  }

  // Tạo yêu cầu thanh toán VNPay
  const { vnpayParams, vnpayUrl } = createVnpayPaymentRequest(order, discountAmount);

  // Lưu thông tin thanh toán vào database
  const payment = new Payment({
    order: orderId,
    amount: order.total_amount - discountAmount,
    payment_method: 'VNPay',
    status: 'pending',
    transaction_id: vnpayParams.vnp_TxnRef,
    discount_code: discountCode,
    discount_amount: discountAmount,
    applied_voucher: voucher ? voucher._id : null,
  });

  await payment.save();

  return { vnpayUrl, vnpayParams };
};

// Lưu kết quả thanh toán khi VNPay trả về
export const paymentReturn = async (queryParams) => {
  const { vnp_TxnRef, vnp_SecureHash } = queryParams;

  // Xác minh mã hash trả về từ VNPay
  const isValid = verifyPaymentReturn(queryParams);
  if (!isValid) {
    throw new Error('Invalid payment response');
  }

  // Lưu kết quả thanh toán vào database
  const payment = await Payment.findOne({ transaction_id: vnp_TxnRef });
  if (!payment) {
    throw new Error('Payment not found');
  }

  payment.status = 'success';
  payment.payment_date = new Date();
  await payment.save();

  return payment;
};
