import fs from 'fs/promises'; // Sử dụng cho việc xử lý file tạm
import { chunkUpload } from '../config/chunkUpload.js'; // Giả sử file chunkUpload.js nằm trong thư mục utils
import upload from '../config/multerConfig.js';
import cloudinary from '../config/cloudinaryConfig.js';

/**
 * **Upload a Single Image (with chunking)**
 */
export const uploadImage = async (req, res) => {
  // Kiểm tra lỗi và tệp đã được upload chưa
  if (!req.file) {
    return res.status(400).json({ message: 'No image file provided.' });
  }

  const filePath = req.file.path; // Đường dẫn tệp đã được multer xử lý
  const folder = 'uploads'; // Thư mục upload của Cloudinary
  const publicId = `${Date.now()}_${req.file.filename}`; // Đặt tên file duy nhất

  try {
    // Sử dụng chunkUpload để chia nhỏ tệp và tải lên Cloudinary
    const uploadResponse = await chunkUpload(filePath, folder, publicId);
    res.status(200).json({
      message: 'Image uploaded successfully',
      imageUrl: uploadResponse.secure_url, // Trả về URL của ảnh
    });
  } catch (error) {
    res.status(500).json({ message: `Failed to upload image: ${error.message}` });
  }
};

/**
 * **Upload Multiple Images (with chunking)**
 */
export const uploadImages = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No image files provided.' });
  }

  const folder = 'uploads'; // Thư mục upload của Cloudinary
  const imageUrls = [];

  try {
    // Lặp qua tất cả các tệp để xử lý từng tệp bằng chunkUpload
    for (const file of req.files) {
      const filePath = file.path;
      const publicId = `${Date.now()}_${file.filename}`; // Đặt tên file duy nhất cho mỗi ảnh
      const uploadResponse = await chunkUpload(filePath, folder, publicId);
      imageUrls.push(uploadResponse.secure_url); // Lưu URL của ảnh đã upload
    }

    res.status(200).json({
      message: 'Images uploaded successfully',
      imageUrls, // Trả về danh sách các URL
    });
  } catch (error) {
    res.status(500).json({ message: `Failed to upload images: ${error.message}` });
  }
};

/**
 * **Get Image URL by Public ID**
 */
export const getImageUrl = (publicId) => {
  return cloudinary.url(publicId, { secure: true });
};

/**
 * **Delete Image by Public ID**
 */
export const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};

/**
 * **Update Image**
 */
export const updateImage = async (req, res) => {
  const { publicId } = req.body;
  if (!publicId) {
    return res.status(400).json({ message: 'Public ID of the image is required.' });
  }

  try {
    // Xóa ảnh cũ
    await deleteImage(publicId);

    // Upload ảnh mới
    upload.single('image')(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ message: `Failed to upload image: ${err.message}` });
      }
      if (!req.file) {
        return res.status(400).json({ message: 'No new image file provided.' });
      }

      // Sử dụng chunkUpload để upload ảnh mới
      const filePath = req.file.path;
      const folder = 'uploads';
      const publicIdNew = `${Date.now()}_${req.file.filename}`;
      const uploadResponse = await chunkUpload(filePath, folder, publicIdNew);

      res.status(200).json({
        message: 'Image updated successfully',
        imageUrl: uploadResponse.secure_url,
      });
    });
  } catch (error) {
    res.status(500).json({ message: `Failed to update image: ${error.message}` });
  }
};

export default { uploadImage, uploadImages, getImageUrl, deleteImage, updateImage };
