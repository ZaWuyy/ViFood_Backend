import express from 'express';
import {  createComment,
    updateComment,
    deleteComment,
    getCommentsByUser,
    getCommentsByProduct,
    getAllComments,
    getSpecificCommentById } from '../controllers/commentController';

import { verifyToken } from '../middleware/auth';

const router = express.Router();

router.post('/', verifyToken, createComment);
router.put('/:id', verifyToken, updateComment);
router.delete('/:id', verifyToken, deleteComment);
router.get('/user', verifyToken, getCommentsByUser);
router.get('/product/:productId', getCommentsByProduct);
router.get('/', getAllComments);
router.get('/:id', getSpecificCommentById);

export default router;
