import Category from '../models/categoryModel.js';
import { uploadImage, deleteImage } from '../controllers/uploadImageController.js';

/**
 * **1. Lấy danh sách category với tìm kiếm và lọc**
 */
export const getCategories = async (req, res) => {
  try {
    const { name, active } = req.query; // Lấy thông tin tìm kiếm và lọc từ query string

    const query = {};
    if (name) query.name = { $regex: name, $options: 'i' }; // Tìm kiếm không phân biệt hoa thường
    if (active !== undefined) query.active = active === 'true'; // Lọc theo trạng thái active

    const categories = await Category.find(query);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * **2. Tạo mới category**
 */
export const createCategory = async (req, res) => {
  uploadImage(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: `Failed to upload image: ${err.message}` });
    }

    const { name, description, active } = req.body;
    try {
      const category = new Category({
        name,
        description,
        image: req.file ? { public_id: req.file.filename, url: req.file.path } : null,
        active: active || true,
      });

      const newCategory = await category.save();
      res.status(201).json(newCategory);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
};

/**
 * **3. Cập nhật category**
 */
export const updateCategory = async (req, res) => {
  uploadImage(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: `Failed to upload image: ${err.message}` });
    }

    try {
      const category = await Category.findById(req.params.id);
      if (!category) return res.status(404).json({ message: 'Category not found!' });

      // Cập nhật thông tin
      category.name = req.body.name || category.name;
      category.description = req.body.description || category.description;
      category.active = req.body.active !== undefined ? req.body.active : category.active;

      // Nếu có ảnh mới, upload ảnh và xóa ảnh cũ
      if (req.file) {
        // Xóa ảnh cũ trên Cloudinary
        await deleteImage(category.image.public_id);

        // Cập nhật thông tin ảnh
        category.image = { public_id: req.file.filename, url: req.file.path };
      }

      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
};

/**
 * **4. Xóa category**
 */
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Không tìm thấy category!' });

    // Xóa ảnh trên Cloudinary
    await deleteImage(category.image.public_id);

    // Xóa category trong MongoDB
    await category.remove();
    res.json({ message: 'Category đã được xóa thành công!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};