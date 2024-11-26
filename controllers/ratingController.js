const express = require('express');
import ratingModel from '../models/ratingModel';  // Import mô hình Rating
import productModel from '../models/productModel'; // Import mô hình Product (để kiểm tra sản phẩm có tồn tại không)
const {verifyToken} = require('../middleware/auth'); // Import middleware để xác thực token

// updateAverageRating: Cập nhật rating trung bình của sản phẩm
const updateProductAverageRating = async (productId) => {
  try {
    const ratings = await ratingModel.find({ product: productId });
    if (ratings.length === 0) {
      await productModel.findByIdAndUpdate(productId, { avgRating: 0 });
    } else {
      const avg = ratings.reduce((acc, rating) => acc + rating.value, 0) / ratings.length;
      await productModel.findByIdAndUpdate(productId, { avgRating: avg });
    }
  } catch (error) {
    console.error("Error updating average rating:", error);
    throw error;
  }
};

// createRating: Tạo mới rating
const createRating = async (req, res) => {
  const { value, comment, images, product } = req.body;
  const userId = req.user.id;

  try {
    // Check if the user has already rated this hotel
    const existingRating = await ratingModel.findOne({ user: userId, product });
    if (existingRating) {
      return res.status(400).json({ message: "You have already rated this product." });
    }

    const newRating = new ratingModel({
      user: userId,
      product,
      value,
      comment,
      images,
    });

    await newRating.save();

    // Add rating to hotel's ratings array
    await productModel.findByIdAndUpdate(product, { $push: { ratings: newRating._id } });

    // Update the average rating of the hotel
    await updateProductAverageRating(product);

    res.status(201).json(newRating);
  } catch (error) {
    // Handle duplicate key error gracefully
    if (error.code === 11000) {
      return res.status(400).json({ message: "You have already rated this hotel." });
    }
    res.status(500).json({ message: "Failed to create rating", error: error.message });
  }
};

// get all ratings 
const getAllRatings = async (req, res) => {
  try {
    const ratings = await ratingModel.find().populate("user", "username");
    res.json(ratings);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error}` });
  }
};

// get a specific rating by id
const getSpecificRatingbyId =  async (req, res) => {
  try {
    const rating = await ratingModel.findById(req.params.id).populate("user", "username");
    if (!rating) {
      return res.status(404).json({ message: "Rating not found" });
    }
    res.json(rating);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error}` });
  }
};

// Get ratings by user
const getRatingsbyUser = async (req, res) => {
  const userId = req.user.id;

  try {
    const ratings = await ratingModel.find({ user: userId });
    res.status(200).json(ratings);
  } catch (error) {
    res.status(500).json({ message: "Failed to get ratings", error: error.message });
  }
};

// get all ratings of a product
const getRatingsByProduct = async (req, res) => {
  const { productId } = req.params;
  try {
    // Lấy tất cả rating của sản phẩm
    const product = await productModel.find(productId).populate('ratings');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const ratings = await ratingModel.find({ product: productId }).populate("user", "avatarUrl firstname lastname email");
    res.status(200).json(ratings);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// updateRating: Cập nhật rating
const updateRating = async (req, res) => {
  const { value, comment, images } = req.body;
  const userId = req.user.id;
  try {
    const rating = await ratingModel.findById(req.params.id);
    if (!rating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    // Check if the user has permission to update the rating
    if (rating.user.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    rating.value = value;
    rating.comment = comment;
    rating.images = images;

    await rating.save();

    // Update the average rating of the hotel
    await updateProductAverageRating(rating.product);

    res.json(rating);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// deleteRating: Xóa rating
const deleteRating = async (req, res) => {
  const userId = req.user.id;

  try {
    const rating = await ratingModel.findById(req.params.id);
    if (!rating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    if (rating.user.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const productId = rating.product;

    await rating.remove();

    // Remove rating from hotel's ratings array
    await productModel.findByIdAndUpdate(productId, { $pull: { ratings: rating._id } });

    // Update the average rating of the hotel
    await updateProductAverageRating(productId);

    res.json({ message: "Rating deleted" });
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error}` });
  }
};

export default { updateProductAverageRating, createRating, getAllRatings, getSpecificRatingbyId, getRatingsbyUser,getRatingsByProduct, updateRating, deleteRating };

