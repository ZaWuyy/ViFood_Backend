import express from 'express';
import { verifyToken } from '../middleware/auth';
import { createRating, getAllRatings, getSpecificRatingbyId, getRatingsbyUser,getRatingsByProduct, updateRating, deleteRating } from '../controllers/ratingController';

const router = express.Router();

// Routes cho Rating
router.post('/', verifyToken, createRating);  // Tạo rating
router.get('/user', verifyToken, getRatingsbyUser);  // Lấy tất cả rating của user
router.get('/product/:productId', getRatingsByProduct);  // Lấy tất cả rating của sản phẩm
router.get('/', getAllRatings);  // Lấy tất cả rating 
router.get('/:id', getSpecificRatingbyId);  // Lấy rating theo id
router.put('/:id', verifyToken, updateRating);  // Cập nhật rating
router.delete('/:id', verifyToken, deleteRating);  // Xóa rating

export default router;
