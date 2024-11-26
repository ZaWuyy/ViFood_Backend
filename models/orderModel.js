// models/Order.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }, // Người dùng
  created_date: { 
    type: Date, 
    default: Date.now 
  }, // Ngày tạo đơn hàng
  total_price: { 
    type: Number, 
    required: true 
  }, // Tổng giá trị đơn hàng
  note: { 
    type: String 
  }, // Ghi chú đơn hàng
  address: { 
    type: String, 
    required: true 
  }, // Địa chỉ
  phone: { 
    type: String, 
    required: true 
  }, // Số điện thoại
  order_details: [{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'OrderDetail'
  }], // Danh sách chi tiết đơn hàng (liên kết tới OrderDetail)
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'canceled', 'delivered', 'completed'], 
    default: 'pending' 
  }, // Trạng thái đơn hàng
  method: { 
    type: String, 
    enum: ['online', 'offline'], 
    required: true 
  }, // Phương thức thanh toán
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;
