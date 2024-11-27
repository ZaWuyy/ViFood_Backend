// userRoute.js
import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
    createUser,
    updateUser,
    deleteUser,
    getUser,
    getUsers,
    fetchProfile,
    updateProfile,
    sendVerificationEmail,
    verifyEmail,
    addVoucher,
    removeVoucher,
    addFavoriteProduct,
    removeFavoriteProduct
} from '../controllers/userController.js';
import { uploadImage } from '../controllers/uploadImageController.js';

const router = express.Router();

// Fetch user profile
router.get('/profile', verifyToken, fetchProfile);

// Update user profile with avatar upload
router.put('/profile', verifyToken, uploadImage, updateProfile);

// Send verification email
router.post('/send-verification-email', verifyToken, sendVerificationEmail);

// Verify email
router.post('/verify-email', verifyToken, verifyEmail);

// Admin routes to create, update, delete users
router.post('/create', verifyToken, createUser);
router.put('/update/:id', verifyToken, updateUser);
router.delete('/delete/:id', verifyToken, deleteUser);

// Fetch a single user by ID
router.get('/:id', verifyToken, getUser);

// Fetch a list of users with search and filter
router.get('/', verifyToken, getUsers);

// **Voucher Routes**
router.post('/vouchers/save', verifyToken, addVoucher);
router.post('/vouchers/remove', verifyToken, removeVoucher);

// **Favorite Products Routes**
router.post('/favorites/add', verifyToken, addFavoriteProduct);
router.post('/favorites/remove', verifyToken, removeFavoriteProduct);

export default router;