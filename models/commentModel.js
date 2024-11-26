import mongoose from 'mongoose';


const commentSchema = new Schema({
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
  commentText: {
    type: String,
    required: true,
    maxlength: 1000,  // Giới hạn độ dài của bình luận
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
