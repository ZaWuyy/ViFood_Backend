import mongoose from 'mongoose';

const ratingSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Liên kết đến model User
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',  // Liên kết đến model Product
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,  // Điểm đánh giá tối thiểu
    max: 5,  // Điểm đánh giá tối đa
  },
  comment: {
    type: String,
    maxlength: 500,  // Giới hạn độ dài của bình luận
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;
