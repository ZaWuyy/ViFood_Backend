import mongoose from 'mongoose';

// Blog Schema
const BlogSchema = new mongoose.Schema({
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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Image', // Embedding the Image model for an array of images
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
});

const Blog = mongoose.model('Blog', BlogSchema);
export default Blog;
