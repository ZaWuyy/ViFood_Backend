import Product from '../models/Product.js';  // Import Product model
import { Types } from 'mongoose';

/**
 * **1. Lấy danh sách tất cả products**
 */
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('category')  // Populate category details
      .populate('createdBy') // Populate user who created the product
      .populate('variants'); // Populate variants associated with the product
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * **2. Tạo mới product**
 */
export const createProduct = async (req, res) => {
  const { name, description, category, createdBy, variants } = req.body;

  if (!name || !description || !category || !createdBy || !variants) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newProduct = new Product({
      name,
      description,
      category,
      createdBy,
      variants,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * **3. Cập nhật product**
 */
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category')
      .populate('createdBy')
      .populate('variants');
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const { name, description, category, variants } = req.body;

    product.name = name || product.name;
    product.description = description || product.description;
    product.category = category || product.category;
    product.variants = variants || product.variants;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * **4. Xóa product**
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await product.remove();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * **5. Lấy product theo ID**
 */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category')
      .populate('createdBy')
      .populate('variants');
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
