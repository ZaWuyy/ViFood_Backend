import express from 'express';
import { createUser, updateUser, deleteUser, getUser, getUsers, fectchProfile, updateProfile, sendVerificationEmail, verifyEmail } from '../controllers/userController.js'; 
import { verifyToken } from '../middleware/auth';

const router = express.Router();

// profile
router.get('/profile', verifyToken,fectchProfile);
// update profile
router.put('/profile', verifyToken, updateProfile);
// send verification email
router.post('/send-verification-email', verifyToken, sendVerificationEmail);
// verify email
router.post('/verify-email', verifyToken, verifyEmail);
// Create a new user
router.post('/',  verifyToken, createUser);
// Retrieve all users
router.get('/',  verifyToken, getUsers);
// Retrieve a single user with id
router.get('/:id', verifyToken,  getUser);
// Update a user with id
router.put('/:id',  verifyToken, updateUser);
// Delete a user with id
router.delete('/:id',  verifyToken, deleteUser);


export default router;