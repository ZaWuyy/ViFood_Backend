import Comment from '../models/commentModel'; // Adjust the path as necessary
import Product from '../models/productModel'; // Adjust the path as necessary

// Create a new comment
export const createComment = async (req, res) => {
  try {
    const { productId, commentText, images } = req.body;

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Create new comment
    const newComment = new Comment({
      user: req.user._id, // Assuming the logged-in user's info is in req.user
      product: productId,
      commentText,
      images,
    });

    await newComment.save();
    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

// Update a comment
export const updateComment = async (req, res) => {
  const { commentText, images } = req.body;
  const userId = req.user._id;
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the user has permission to update the comment
    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    comment.commentText = commentText;
    comment.images = images;

    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  const userId = req.user._id;
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await comment.remove();
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// Get all comments by user
export const getCommentsByUser = async (req, res) => {
  const userId = req.user._id;
  try {
    const comments = await Comment.find({ user: userId }).populate('product', 'name');
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get comments', error: error.message });
  }
};

// Get all comments by product
export const getCommentsByProduct = async (req, res) => {
  const { productId } = req.params;
  try {
    const comments = await Comment.find({ product: productId }).populate('user', 'avatarUrl firstname lastname email');
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// Get all comments
export const getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find().populate('user', 'username').populate('product', 'name');
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error}` });
  }
};

// Get a specific comment by ID
export const getSpecificCommentById = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id).populate('user', 'username').populate('product', 'name');
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error}` });
  }
};

export default {
  createComment,
  updateComment,
  deleteComment,
  getCommentsByUser,
  getCommentsByProduct,
  getAllComments,
  getSpecificCommentById
};