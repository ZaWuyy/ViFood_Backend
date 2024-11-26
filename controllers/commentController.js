import Comment from '../models/Comment'; // Import mô hình Comment
import Product from '../models/Product'; // Import mô hình Product (để kiểm tra sản phẩm có tồn tại không)

export const createComment = async (req, res) => {
  try {
    const { productId, commentText } = req.body;

    // Kiểm tra xem sản phẩm có tồn tại không
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Tạo mới comment
    const newComment = new Comment({
      userId: req.user._id, // Giả sử user đang đăng nhập có thông tin trong req.user
      productId,
      commentText,
    });

    await newComment.save();
    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const getCommentsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Lấy tất cả comment của sản phẩm
    const comments = await Comment.find({ productId }).populate('userId', 'name');

    if (!comments.length) {
      return res.status(404).json({ message: 'No comments found for this product' });
    }

    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    // Xóa comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Kiểm tra quyền xóa của người dùng (Chỉ người tạo mới được xóa)
    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await comment.remove();
    res.status(200).json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};
