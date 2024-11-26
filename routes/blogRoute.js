import express from 'express';
import {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
} from '../controllers/blogController.js';

const router = express.Router();

// CRUD routes
router.get('/list', getBlogs); // GET /list to fetch all blogs
router.get('/:id', getBlogById); // GET /:id to fetch a single blog by ID
router.post('/add', createBlog); // POST /add to create a new blog
router.put('/update/:id', updateBlog); // PUT /update/:id to update an existing blog
router.delete('/delete/:id', deleteBlog); // DELETE /delete/:id to delete a blog

export default router;