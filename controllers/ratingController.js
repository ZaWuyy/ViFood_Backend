import Rating from '../models/Rating';  // Import mô hình Rating
import Product from '../models/Product'; // Import mô hình Product (để kiểm tra sản phẩm có tồn tại không)

export const createRating = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // Kiểm tra xem sản phẩm có tồn tại không
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Tạo mới rating
    const newRating = new Rating({
      userId: req.user._id, // Giả sử user đang đăng nhập có thông tin trong req.user
      productId,
      rating,
      comment,
    });

    await newRating.save();
    res.status(201).json(newRating);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const getRatingsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Lấy tất cả rating của sản phẩm
    const ratings = await Rating.find({ productId }).populate('userId', 'name');

    if (!ratings.length) {
      return res.status(404).json({ message: 'No ratings found for this product' });
    }

    res.status(200).json(ratings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const deleteRating = async (req, res) => {
  try {
    const { ratingId } = req.params;

    // Xóa rating
    const rating = await Rating.findById(ratingId);
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    // Kiểm tra quyền xóa của người dùng (Chỉ người tạo mới được xóa)
    if (rating.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await rating.remove();
    res.status(200).json({ message: 'Rating deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};
