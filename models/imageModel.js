import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  public_id: {
    type: String,
    required: true, // ID public của ảnh trên Cloudinary
  },
  url: {
    type: String,
    required: true, // URL của ảnh trên Cloudinary
  },
  createdAt: {
    type: Date,
    default: Date.now, // Thời gian tạo ảnh
  },
});

const Image = mongoose.model('Image', imageSchema);

export default Image;
