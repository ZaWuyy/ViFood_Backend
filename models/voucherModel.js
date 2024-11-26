// models/Voucher.js
import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema({
  name: {type: String, required: true},
  code: { 
    type: String, 
    required: true, 
    unique: true 
  },
  discountType: { 
    type: String, 
    enum: ['percentage', 'fixed'], 
    default: 'percentage', 
    required: true
  }, // Loại giảm giá: phần trăm hoặc số tiền cố định
  discount: { 
    type: Number, 
    required: true, 
    validate: {
      validator: function(value) {
        if (this.discountType === 'percentage') {
          return value >= 0 && value <= 100;
        }
        return true;
      },
      message: 'Discount percentage must be between 0 and 100',
    },
  },
  expiryDate: { 
    type: Date, 
    required: true, 
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Expiry date must be in the future',
    }
  },
  minOrderValue: { 
    type: Number, 
    required: true 
  }, // Giá trị đơn hàng tối thiểu để áp dụng voucher
  maxDiscountAmount: { 
    type: Number, 
    default: 0, 
    required: true 
  }, // Số tiền giảm tối đa
  quantity: { 
    type: Number, 
    required: true 
  }, // Số lượng voucher còn lại
  status: { 
    type: String, 
    enum: ['active', 'expired'], 
    default: 'active' 
  },
  updatedDate: { 
    type: Date, 
    default: Date.now 
  },
}, { timestamps: true });

const Voucher = mongoose.models.Voucher || mongoose.model("Voucher", voucherSchema);

export default Voucher;
