// productController.js
import Product from '../models/productModel.js';
import ProductVariant from '../models/productVariantModel.js';

/**
 * **1. Get All Products with Filters**
 */
export const getProducts = async (req, res) => {
  try {
    const { search, category, priceMin, priceMax, sortBy, sortOrder, page = 1, limit = 10 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = Number(priceMin);
      if (priceMax) query.price.$lte = Number(priceMax);
    }

    let sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    const products = await Product.find(query)
      .populate('category')
      .populate('createdBy', 'username email')
      .populate({
        path: 'variants',
        populate: { path: 'images' }, // Populate images within variants if needed
      })
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      products,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Server error fetching products.' });
  }
};

/**
 * **2. Create New Product**
 */
export const createProduct = async (req, res) => {
  const { name, description, category, variants } = req.body;

  if (!name || !description || !category || !variants || !Array.isArray(variants)) {
    return res.status(400).json({ success: false, message: 'Name, description, category, and variants are required.' });
  }

  try {
    // Validate that all variant IDs exist
    const existingVariants = await ProductVariant.find({ _id: { $in: variants } });
    if (existingVariants.length !== variants.length) {
      return res.status(400).json({ success: false, message: 'One or more variants are invalid.' });
    }

    const newProduct = new Product({
      name,
      description,
      category,
      createdBy: req.user.id, // Assumes authentication middleware sets req.user.id
      variants,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json({ success: true, message: 'Product created successfully', product: savedProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: 'Server error creating product.', error });
  }
};

/**
 * **3. Update Product**
 */
export const updateProduct = async (req, res) => {
  const { name, description, category, variants, active } = req.body;

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found!' });
    }

    // Check if the user is the creator or has admin privileges
    if (product.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this product.' });
    }

    // Update fields if provided
    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (active !== undefined) product.active = active;

    if (variants) {
      if (!Array.isArray(variants)) {
        return res.status(400).json({ success: false, message: 'Variants must be an array of variant IDs.' });
      }

      // Validate that all variant IDs exist
      const existingVariants = await ProductVariant.find({ _id: { $in: variants } });
      if (existingVariants.length !== variants.length) {
        return res.status(400).json({ success: false, message: 'One or more variants are invalid.' });
      }

      product.variants = variants;
    }

    const updatedProduct = await product.save();
    res.status(200).json({ success: true, message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Server error updating product.', error });
  }
};

/**
 * **4. Delete Product**
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('variants');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found!' });
    }

    // Check if the user is the creator or has admin privileges
    if (product.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this product.' });
    }

    // Optionally, delete all associated variants
    if (product.variants && product.variants.length > 0) {
      const variantIds = product.variants.map(variant => variant._id);
      await ProductVariant.deleteMany({ _id: { $in: variantIds } });
    }

    await product.remove();
    res.status(200).json({ success: true, message: 'Product and associated variants deleted successfully!' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Server error deleting product.', error });
  }
};

/**
 * **5. Get Product by ID**
 */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category')
      .populate('createdBy', 'username email')
      .populate({
        path: 'variants',
        populate: { path: 'images' }, // Populate images within variants if needed
      });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ success: false, message: 'Server error fetching product.' });
  }
};

/**
 * **6. Get Products by User**
 */
export const getProductsByUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const products = await Product.find({ createdBy: userId })
      .populate('category')
      .populate({
        path: 'variants',
        populate: { path: 'images' }, // Populate images within variants if needed
      });

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error('Error fetching products by user:', error);
    res.status(500).json({ success: false, message: 'Server error fetching user products.' });
  }
};

export default {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  getProductsByUser,
};