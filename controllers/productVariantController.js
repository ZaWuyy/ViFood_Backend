// productVariantController.js
import ProductVariant from '../models/productVariantModel.js';
import { deleteImage } from '../controllers/uploadImageController.js';

/**
 * **1. Get Product Variants**
 */
export const getProductVariants = async (req, res) => {
  try {
    const { active } = req.query;

    const query = {};
    if (active !== undefined) query.active = active === 'true'; // Filter by active status

    const variants = await ProductVariant.find(query);
    res.json({ success: true, variants });
  } catch (error) {
    console.error('Error fetching product variants:', error);
    res.status(500).json({ success: false, message: 'Server error fetching product variants.' });
  }
};

/**
 * **2. Create New Product Variant**
 */
export const createProductVariant = async (req, res) => {
  try {
    const { size, price, quantity, percentDiscount, active } = req.body;

    // Assign uploaded images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => ({
        public_id: file.filename,
        url: file.path,
      }));
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
    res.status(201).json({ success: true, variant: newVariant });
  } catch (error) {
    console.error('Error creating product variant:', error);
    res.status(500).json({ success: false, message: 'Server error creating product variant.' });
  }
};

/**
 * **3. Update Product Variant**
 */
export const updateProductVariant = async (req, res) => {
  try {
    const variant = await ProductVariant.findById(req.params.id);
    if (!variant) {
      return res.status(404).json({ success: false, message: 'Variant not found!' });
    }

    const { size, price, quantity, percentDiscount, active } = req.body;

    variant.size = size || variant.size;
    variant.price = price || variant.price;
    variant.quantity = quantity || variant.quantity;
    variant.percentDiscount = percentDiscount !== undefined ? percentDiscount : variant.percentDiscount;
    variant.active = active !== undefined ? active : variant.active;

    // If there are new images, delete the old ones and assign new images
    if (req.files && req.files.length > 0) {
      // Delete old images from Cloudinary
      if (variant.images && variant.images.length > 0) {
        for (const img of variant.images) {
          await deleteImage(img.public_id);
        }
      }

      // Assign new images
      variant.images = req.files.map(file => ({
        public_id: file.filename,
        url: file.path,
      }));
    }

    const updatedVariant = await variant.save();
    res.json({ success: true, variant: updatedVariant });
  } catch (error) {
    console.error('Error updating product variant:', error);
    res.status(500).json({ success: false, message: 'Server error updating product variant.' });
  }
};

/**
 * **4. Delete Product Variant**
 */
export const deleteProductVariant = async (req, res) => {
  try {
    const variant = await ProductVariant.findById(req.params.id);
    if (!variant) {
      return res.status(404).json({ success: false, message: 'Variant not found!' });
    }

    // Delete images from Cloudinary
    if (variant.images && variant.images.length > 0) {
      for (const img of variant.images) {
        await deleteImage(img.public_id);
      }
    }

    await variant.remove();
    res.json({ success: true, message: 'Product variant has been successfully deleted!' });
  } catch (error) {
    console.error('Error deleting product variant:', error);
    res.status(500).json({ success: false, message: 'Server error deleting product variant.' });
  }
};

export default { getProductVariants, createProductVariant, updateProductVariant, deleteProductVariant };