import express from 'express';
import { verifyToken } from '../middleware/auth.js'; // Import middleware để xác thực token
import {
  createRating,
  getAllRatings,
  getSpecificRatingbyId,
  getRatingsbyUser,
  getRatingsByProduct,
  updateRating,
  deleteRating,
} from '../controllers/ratingController.js';
import { uploadImage } from '../controllers/uploadImageController.js'; // Import the uploadImage middleware

const router = express.Router();

// Route to create a new rating (with image upload)
router.post('/', verifyToken, uploadImage, createRating);

// Route to get all ratings
router.get('/', getAllRatings);

// Route to get a specific rating by ID
router.get('/:id', getSpecificRatingbyId);

// Route to get ratings by user
router.get('/user/:userId', verifyToken, getRatingsbyUser);

// Route to get all ratings of a product
router.get('/product/:productId', getRatingsByProduct);

// Route to update a rating (with image upload)
router.put('/:id', verifyToken, uploadImage, updateRating);

// Route to delete a rating
router.delete('/:id', verifyToken, deleteRating);

export default router;