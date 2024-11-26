import ProductVariant from '../models/ProductVariant.js';
import cloudinary from '../config/cloudinaryConfig.js';

/**
 * **1. Lấy danh sách product variants**
 */
export const getProductVariants = async (req, res) => {
  try {
    const { active } = req.query;

    const query = {};
    if (active !== undefined) query.active = active === 'true'; // Lọc theo trạng thái active

    const variants = await ProductVariant.find(query).populate('images');
    res.json(variants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * **2. Tạo mới product variant**
 */
export const createProductVariant = async (req, res) => {
  try {
    const { size, price, quantity, percentDiscount, active } = req.body;

    // Upload ảnh lên Cloudinary
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, { folder: 'product_variants' });
        images.push({ public_id: result.public_id, url: result.secure_url });
      }
    }

    const variant = new ProductVariant({
      size,
      price,
      quantity,
      percentDiscount,
      active,
      images,
    });

    const newVariant = await variant.save();
    res.status(201).json(newVariant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * **3. Cập nhật product variant**
 */
export const updateProductVariant = async (req, res) => {
  try {
    const variant = await ProductVariant.findById(req.params.id).populate('images');
    if (!variant) return res.status(404).json({ message: 'Không tìm thấy variant!' });

    const { size, price, quantity, percentDiscount, active } = req.body;

    variant.size = size || variant.size;
    variant.price = price || variant.price;
    variant.quantity = quantity || variant.quantity;
    variant.percentDiscount = percentDiscount || variant.percentDiscount;
    variant.active = active !== undefined ? active : variant.active;

    // Nếu có ảnh mới, xóa ảnh cũ và upload ảnh mới
    if (req.files && req.files.length > 0) {
      for (const img of variant.images) {
        await cloudinary.uploader.destroy(img.public_id); // Xóa ảnh cũ trên Cloudinary
      }

      const newImages = [];
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, { folder: 'product_variants' });
        newImages.push({ public_id: result.public_id, url: result.secure_url });
      }

      variant.images = newImages;
    }

    const updatedVariant = await variant.save();
    res.json(updatedVariant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * **4. Xóa product variant**
 */
export const deleteProductVariant = async (req, res) => {
  try {
    const variant = await ProductVariant.findById(req.params.id).populate('images');
    if (!variant) return res.status(404).json({ message: 'Không tìm thấy variant!' });

    // Xóa ảnh trên Cloudinary
    for (const img of variant.images) {
      await cloudinary.uploader.destroy(img.public_id);
    }

    await variant.remove();
    res.json({ message: 'Product variant đã được xóa thành công!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
