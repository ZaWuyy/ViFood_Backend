import Category from '../models/categoryModel.js';
import cloudinary from '../config/cloudinaryConfig.js';

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
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng upload ảnh!' });
    }

    // Upload ảnh lên Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'categories', // Thư mục lưu trữ trên Cloudinary
    });

    // Tạo category mới
    const { name, description, active } = req.body;
    const category = new Category({
      name,
      description,
      image: {
        public_id: result.public_id, // ID ảnh trên Cloudinary
        url: result.secure_url, // URL của ảnh
      },
      active: active || true,
    });

    const newCategory = await category.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * **3. Cập nhật category**
 */
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Không tìm thấy category!' });

    // Cập nhật thông tin
    category.name = req.body.name || category.name;
    category.description = req.body.description || category.description;
    category.active = req.body.active !== undefined ? req.body.active : category.active;

    // Nếu có ảnh mới, upload ảnh và xóa ảnh cũ
    if (req.file) {
      // Xóa ảnh cũ trên Cloudinary
      await cloudinary.uploader.destroy(category.image.public_id);

      // Upload ảnh mới
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'categories',
      });

      // Cập nhật thông tin ảnh
      category.image.public_id = result.public_id;
      category.image.url = result.secure_url;
    }

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * **4. Xóa category**
 */
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Không tìm thấy category!' });

    // Xóa ảnh trên Cloudinary
    await cloudinary.uploader.destroy(category.image.public_id);

    // Xóa category trong MongoDB
    await category.remove();
    res.json({ message: 'Category đã được xóa thành công!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
