import Blog from '../models/blogModel.js';

// Get all blogs với chức năng tìm kiếm và lọc
export const getBlogs = async (req, res) => {
  const { keyword, category, page = 1, limit = 10 } = req.query;

  // Tạo đối tượng filter dựa trên các tham số truy vấn
  let filter = {};

  if (keyword) {
    filter.$or = [
      { title: { $regex: keyword, $options: 'i' } },
      { content: { $regex: keyword, $options: 'i' } },
    ];
  }

  if (category) {
    filter.categories = category;
  }

  try {
    const blogs = await Blog.find(filter)
      .populate('categories')
      .populate('images')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 }); // Sắp xếp theo ngày tạo giảm dần

    const total = await Blog.countDocuments(filter);

    res.status(200).json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      blogs,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blogs', error });
  }
};


// Get a single blog by ID
export const getBlogById = async (req, res) => {
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
export const createBlog = async (req, res) => {
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
export const updateBlog = async (req, res) => {
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
export const deleteBlog = async (req, res) => {
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

export default { getBlogs, getBlogById, createBlog, updateBlog, deleteBlog };