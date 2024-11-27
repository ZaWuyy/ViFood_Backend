import mongoose from 'mongoose';


const commentSchema = new Schema({
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
  commentText: {
    type: String,
    required: true,
    maxlength: 1000,  // Giới hạn độ dài của bình luận
  },
  images:[{
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },],  // Mảng chứa đường dẫn ảnh của bình luận
  createdAt: {
    type: Date,
    default: Date.now,
  },
  reply: [commentSchema]  // Liên kết đến chính model Comment
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
