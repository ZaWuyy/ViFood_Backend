import mongoose from 'mongoose';

const productVariantSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true, // Kích thước sản phẩm
    trim: true,
  },
  price: {
    type: Number,
    required: true, // Giá sản phẩm
  },
  images: [
  {
      public_id: {
        type: String,
        required: true, // Public ID from Cloudinary
      },
      url: {
        type: String,
        required: true, // URL of the uploaded image
      },
    },
  ],
  quantity: {
    type: Number,
    required: true, // Số lượng sản phẩm
  },
  percentDiscount: {
    type: Number,
    default: 0, // Phần trăm giảm giá mặc định
  },
  active: {
    type: Boolean,
    default: true, // Trạng thái của sản phẩm
  },
  createdAt: {
    type: Date,
    default: Date.now, // Ngày tạo sản phẩm
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Ngày cập nhật sản phẩm
  },
});

// Middleware tự động cập nhật `updatedAt`
productVariantSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const ProductVariant = mongoose.model('ProductVariant', productVariantSchema);

export default ProductVariant;
