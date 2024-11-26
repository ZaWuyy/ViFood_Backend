import express from 'express';
import { createComment, getCommentsByProduct, deleteComment } from '../controllers/commentController';

const router = express.Router();

// Routes cho Comment
router.post('/', createComment);  // Tạo comment
router.get('/product/:productId', getCommentsByProduct); // Lấy comment theo sản phẩm
router.delete('/:commentId', deleteComment);  // Xóa comment

export default router;
