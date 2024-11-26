import express from 'express';
import { createRating, getRatingsByProduct, deleteRating } from '../controllers/ratingController';

const router = express.Router();

// Routes cho Rating
router.post('/', createRating);  // Tạo rating
router.get('/product/:productId', getRatingsByProduct); // Lấy rating theo sản phẩm
router.delete('/:ratingId', deleteRating);  // Xóa rating

export default router;
