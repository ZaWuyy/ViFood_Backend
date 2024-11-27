import express from 'express';
import { verifyToken } from '../middleware/auth.js'; // Import your authentication middleware
import { addToCart, removeFromCart, getCart } from '../controllers/cartController.js';

const router = express.Router();

// Add an item to the cart
router.post('/add', verifyToken, addToCart);

// Remove an item from the cart
router.post('/remove', verifyToken, removeFromCart);

// Get the user's cart
router.get('/', verifyToken, getCart);

export default router;