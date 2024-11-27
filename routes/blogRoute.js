import express from 'express';
import {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} from '../controllers/blogController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// CRUD routes
router.get('/', getBlogs); // GET /list to fetch all blogs
router.get('/:id', getBlogById); // GET /:id to fetch a single blog by ID
router.post('/', verifyToken, createBlog); // POST /add to create a new blog
router.put('/:id', verifyToken, updateBlog); // PUT /update/:id to update an existing blog
router.delete('/:id', verifyToken, deleteBlog); // DELETE /delete/:id to delete a blog

export default router;