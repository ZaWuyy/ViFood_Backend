import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  createComment,
  updateComment,
  deleteComment,
  getCommentsByUser,
  getCommentsByProduct,
  getAllComments,
  getSpecificCommentById,
} from '../controllers/commentController.js';
import { uploadImage } from '../controllers/uploadImageController.js';

const router = express.Router();

// Create a new comment (supports image upload)
router.post('/', verifyToken, uploadImage, createComment);

// Update a comment (supports image upload)
router.put('/:id', verifyToken, uploadImage, updateComment);

// Delete a comment
router.delete('/:id', verifyToken, deleteComment);

// Get all comments by user
router.get('/user/:userId', verifyToken, getCommentsByUser);

// Get all comments by product
router.get('/product/:productId', getCommentsByProduct);

// Get all comments
router.get('/', getAllComments);

// Get a specific comment by ID
router.get('/:id', getSpecificCommentById);

export default router;