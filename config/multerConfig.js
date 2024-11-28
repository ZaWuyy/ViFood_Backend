import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinaryConfig.js';
import { v4 as uuidv4 } from 'uuid'; // Thư viện UUID để tạo tên duy nhất

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const uniqueName = `${uuidv4()}_${Date.now()}`;
    return {
      folder: 'uploads',
      format: 'jpg', // Hoặc giữ nguyên định dạng file: file.mimetype.split('/')[1]
      public_id: uniqueName, // Đặt tên file tùy chỉnh
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
    };
  },
});

const upload = multer({ storage });

export default upload;
