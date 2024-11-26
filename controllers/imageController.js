import { upload, removeImage, updateImage } from '../config/multerConfig.js';

export const uploadImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng cung cấp file ảnh!' });
    }
    res.status(200).json({
      message: 'Ảnh đã được upload thành công!',
      file: req.file, // Thông tin file từ Cloudinary
    });
  } catch (error) {
    res.status(500).json({ message: 'Có lỗi xảy ra khi upload ảnh!', error: error.message });
  }
};
 
export const deleteImage = async (req, res) => {
  const { public_id } = req.params;
  try {
    const result = await removeImage(public_id);
    res.status(200).json({ message: 'Ảnh đã được xóa thành công!', result });
  } catch (error) {
    res.status(500).json({ message: 'Có lỗi xảy ra khi xóa ảnh!', error: error.message });
  }
};


export const updateImageHandler = async (req, res) => {
  const { public_id } = req.params;
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng cung cấp file ảnh mới!' });
    }
    const updatedImage = await updateImage(public_id, req.file);
    res.status(200).json({
      message: 'Ảnh đã được cập nhật thành công!',
      newFile: updatedImage,
    });
  } catch (error) {
    res.status(500).json({ message: 'Có lỗi xảy ra khi cập nhật ảnh!', error: error.message });
  }
};
