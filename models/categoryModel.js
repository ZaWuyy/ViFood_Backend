import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Category name is mandatory
    trim: true, // Removes any extra spaces at the beginning and end
  },
  description: {
    type: String, // Description for the category
    required: true, // Description is mandatory
    trim: true, // Removes extra spaces
  },
  image: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image',
    required: true, // Image is mandatory
  },

  active: {
    type: Boolean,
    default: true, // Indicates if the category is active
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

export default mongoose.model('Category', categorySchema);
