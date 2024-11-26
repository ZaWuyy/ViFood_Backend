import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinaryConfig.js';

// **1. Cấu hình Multer Storage với Cloudinary**
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'uploads', // Tên folder trên Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg'], // Định dạng file cho phép
    transformation: [{ width: 500, height: 500, crop: 'limit' }], // Tùy chỉnh kích thước
  },
});

// Middleware Multer cho phép upload ảnh
const upload = multer({ storage });


const removeImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Không thể xóa ảnh: ${error.message}`);
  }
};

const updateImage = async (oldPublicId, file) => {
  try {
    // Xóa ảnh cũ
    await removeImage(oldPublicId);

    // Upload ảnh mới
    const uploadResult = await cloudinary.uploader.upload(file.path, {
      folder: 'uploads',
    });

    return uploadResult;
  } catch (error) {
    throw new Error(`Không thể cập nhật ảnh: ${error.message}`);
  }
};

export { upload, removeImage, updateImage };
