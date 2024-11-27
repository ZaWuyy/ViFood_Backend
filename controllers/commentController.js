import Comment from '../models/commentModel.js';
import Product from '../models/productModel.js';
import { uploadImage, deleteImage } from '../controllers/uploadImageController.js';

/**
 * **1. Create a new comment**
 */
export const createComment = async (req, res) => {
  uploadImage(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: `Failed to upload image: ${err.message}` });
    }

    const { productId, commentText } = req.body;
    const userId = req.user._id;
    let images = [];

    if (req.file) {
      images.push({ public_id: req.file.filename, url: req.file.path });
    }

    try {
      // Check if the product exists
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Create new comment
      const newComment = new Comment({
        user: userId,
        product: productId,
        commentText,
        images,
      });

      await newComment.save();
      res.status(201).json(newComment);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
};

/**
 * **2. Update a comment**
 */
export const updateComment = async (req, res) => {
  uploadImage(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: `Failed to upload image: ${err.message}` });
    }

    const { commentText } = req.body;
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

      // Update comment text
      comment.commentText = commentText || comment.commentText;

      // If there's a new image, handle the upload and deletion of the old image
      if (req.file) {
        // Delete old images from Cloudinary
        if (comment.images.length > 0) {
          for (const img of comment.images) {
            await deleteImage(img.public_id);
          }
        }

        // Add new image
        comment.images = [{ public_id: req.file.filename, url: req.file.path }];
      }

      await comment.save();
      res.json(comment);
    } catch (error) {
      res.status(500).json({ message: `Server error: ${error.message}` });
    }
  });
};

/**
 * **3. Delete a comment**
 */
export const deleteComment = async (req, res) => {
  const userId = req.user._id;
  const isAdmin = req.user.role === 'admin';
  if (!isAdmin || comment.user.toString() !== userId) {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the user has permission to delete the comment
    if (comment.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Delete images from Cloudinary
    if (comment.images.length > 0) {
      for (const img of comment.images) {
        await deleteImage(img.public_id);
      }
    }

    await comment.remove();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

/**
 * **4. Get all comments by user**
 */
export const getCommentsByUser = async (req, res) => {
  const userId = req.user._id;
  try {
    const comments = await Comment.find({ user: userId }).populate('product', 'name');
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get comments', error: error.message });
  }
};

/**
 * **5. Get all comments by product**
 */
export const getCommentsByProduct = async (req, res) => {
  const { productId } = req.params;
  try {
    const comments = await Comment.find({ product: productId }).populate('user', 'avatarUrl firstname lastname email');
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

/**
 * **6. Get all comments**
 */
export const getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find().populate('user', 'username').populate('product', 'name');
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

/**
 * **7. Get a specific comment by ID**
 */
export const getSpecificCommentById = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id).populate('user', 'username').populate('product', 'name');
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

export default {
  createComment,
  updateComment,
  deleteComment,
  getCommentsByUser,
  getCommentsByProduct,
  getAllComments,
  getSpecificCommentById,
};