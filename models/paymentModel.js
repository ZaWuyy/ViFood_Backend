// models/Payment.js
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  order: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order', 
    required: true 
  }, // Đơn hàng tương ứng
  amount: { 
    type: Number, 
    required: true 
  }, // Số tiền thanh toán
  payment_method: { 
    type: String, 
    default: 'VNPay' 
  }, // Phương thức thanh toán (VNPay là mặc định)
  status: { 
    type: String, 
    enum: ['pending', 'success', 'failed'], 
    default: 'pending' 
  }, // Trạng thái thanh toán
  payment_date: { 
    type: Date,
    default: Date.now  
  }, // Ngày thanh toán
  transaction_id: { 
    type: String 
  }, // ID giao dịch VNPay
  note: { 
    type: String 
  }, // Ghi chú thanh toán
  discount_code: { 
    type: String 
  }, // Mã giảm giá nhập vào
  discount_amount: { 
    type: Number, 
    default: 0 
  }, // Số tiền giảm được từ mã giảm giá
  applied_voucher: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Voucher' 
  }, // Voucher đã được áp dụng
}, { timestamps: true });

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);

export default Payment;
