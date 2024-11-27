import Blog from '../models/blogModel.js';

// Get all blogs
const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().populate('categories').populate('images');
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blogs', error });
  }
};

// Get a single blog by ID
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('categories').populate('images');
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blog', error });
  }
};

// Create a new blog
const createBlog = async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const userId = req.user._id;
  const { title, content, categories, images, status } = req.body;
  if (!isAdmin) {
    return res.status(403).json({ message: 'You are not authorized to create a blog' });
  }
  try {
    const newBlog = new Blog({
      user: userId,
      title,
      content,
      categories,
      images,
      status,
    });
    const savedBlog = await newBlog.save();
    res.status(201).json(savedBlog);
  } catch (error) {
    res.status(500).json({ message: 'Error creating blog', error });
  }
};

// Update an existing blog
const updateBlog = async (req, res) => {
  const { title, content, categories, images, status } = req.body;
  const userId = req.user._id;
  const isAdmin = req.user.role === 'admin';
  if ( userId !== req.blog.user.toString() || !isAdmin ) {
    return res.status(403).json({ message: 'You are not authorized to update this blog' });
  }
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, content, categories, images, status, updatedAt: Date.now() },
      { new: true }
    ).populate('categories').populate('images');
    if (!updatedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(200).json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: 'Error updating blog', error });
  }
};

// Delete a blog
const deleteBlog = async (req, res) => {
  const userId = req.user._id;
  const isAdmin = req.user.role === 'admin';
  if ( userId !== req.blog.user.toString() || !isAdmin ) {
    return res.status(403).json({ message: 'You are not authorized to delete this blog' });
  }
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
    if (!deletedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting blog', error });
  }
};

export { getBlogs, getBlogById, createBlog, updateBlog, deleteBlog };