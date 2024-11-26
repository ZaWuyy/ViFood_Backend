// models/OrderDetail.js
import mongoose from 'mongoose';

const orderDetailSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  }, // Sản phẩm
  quantity: { 
    type: Number, 
    required: true 
  }, // Số lượng
  note: { 
    type: String 
  }, // Ghi chú
  price_per_unit: { 
    type: Number, 
    required: true 
  }, // Giá mỗi sản phẩm
  total_price: { 
    type: Number, 
    required: true 
  }, // Tổng giá của sản phẩm (số lượng * giá mỗi đơn vị)
});

const OrderDetail = mongoose.models.OrderDetail || mongoose.model('OrderDetail', orderDetailSchema);

export default OrderDetail;
