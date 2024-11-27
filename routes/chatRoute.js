// routes/chatRoute.js
import express from 'express';
import {
  getChats,
  getOrCreateChat,
  sendMessage,
  deleteMessageImage,
} from '../controllers/chatController.js';
import { verifyToken } from '../middleware/auth.js';
import { uploadImages } from '../controllers/uploadImageController.js'; // Middleware Multer nếu cần

const router = express.Router();

/**
 * @route   GET /api/chats
 * @desc    Lấy tất cả các cuộc trò chuyện của người dùng hiện tại
 * @access  Private
 */
router.get('/', verifyToken, getChats);

/**
 * @route   GET /api/chats/:userId
 * @desc    Lấy hoặc tạo cuộc trò chuyện với một người dùng cụ thể
 * @access  Private
 */
router.get('/:userId', verifyToken, getOrCreateChat);

/**
 * @route   POST /api/chats/messages
 * @desc    Gửi tin nhắn trong cuộc trò chuyện
 * @access  Private
 */
router.post('/messages', verifyToken, uploadImages, sendMessage);

/**
 * @route   DELETE /api/chats/messages/image
 * @desc    Xóa ảnh khỏi tin nhắn
 * @access  Private
 */
router.delete('/messages/image', verifyToken, deleteMessageImage);

export default router;