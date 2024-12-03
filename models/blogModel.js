import mongoose from 'mongoose';

// Blog Schema
const BlogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }, // Reference to User model
  title: {
    type: String,
    required: true,
    trim: true, // Automatically removes leading/trailing whitespace
  },
  content: {
    type: String,
    required: true,
  },
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category', // Reference to Category model
    },
  ],
  images: [
    {
      type: String,
    },
  ],
  status: {
    type: String,
    enum: ['draft', 'published'], // Status options for the blog
    default: 'draft',
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically sets the creation time
  },
  updatedAt: {
    type: Date,
    default: Date.now, // Automatically sets the last updated time
  },
},{ timestamps: true });
// Thêm text index cho các trường title và content
BlogSchema.index({ title: 'text', content: 'text' });

const Blog = mongoose.model('Blog', BlogSchema);
export default Blog;
