import mongoose from 'mongoose';

const ratingSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Liên kết đến model User
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',  // Liên kết đến model Product
    required: true,
  },
  value: {
    type: Number,
    required: true,
    min: 1,  // Điểm đánh giá tối thiểu
    max: 5,  // Điểm đánh giá tối đa
  },
  comment: {
    type: String,
    maxlength: 500,  // Giới hạn độ dài của bình luận
  },
  images: [String],  // Mảng chứa các đường dẫn ảnh
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

ratingSchema.index({ user: 1, product: 1 }, { unique: true });


const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;
