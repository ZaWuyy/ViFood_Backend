import userModel from '../models/userModel.js';
import productModel from '../models/productModel.js';
import productVariantModel from '../models/productVariantModel.js';
import { verifyToken } from '../middleware/auth.js'; // Import your authentication middleware

/**
 * **Add Item to Cart**
 * Adds a product variant to the user's cart or increments the quantity if it already exists.
 */
const addToCart = async (req, res) => {
    try {
        const { itemId } = req.body; // `itemId` refers to the ProductVariant ID

        // Validate input
        if (!itemId) {
            return res.status(400).json({ success: false, message: 'Item ID is required.' });
        }

        const userId = req.user.id; // Obtained from verifyToken middleware

        // Find the user
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Check if the product variant exists and is active
        const variant = await productVariantModel.findById(itemId);
        if (!variant || !variant.active) {
            return res.status(404).json({ success: false, message: 'Product variant not found or inactive.' });
        }

        // Initialize cartData if it doesn't exist
        if (!user.cartData) {
            user.cartData = {};
        }

        // Add or update the cart item
        if (user.cartData[itemId]) {
            user.cartData[itemId] += 1;
        } else {
            user.cartData[itemId] = 1;
        }

        // Save the updated user document
        await user.save();

        res.status(200).json({ success: true, message: 'Item added to cart.' });
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({ success: false, message: 'Error in adding item to cart.' });
    }
};

/**
 * **Remove Item from Cart**
 * Decrements the quantity of a product variant in the user's cart or removes it entirely if the quantity reaches zero.
 */
const removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.body; // `itemId` refers to the ProductVariant ID

        // Validate input
        if (!itemId) {
            return res.status(400).json({ success: false, message: 'Item ID is required.' });
        }

        const userId = req.user.id; // Obtained from verifyToken middleware

        // Find the user
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Check if the product variant exists in the cart
        if (!user.cartData || !user.cartData[itemId] || user.cartData[itemId] <= 0) {
            return res.status(400).json({ success: false, message: 'Item not in cart or already removed.' });
        }

        // Decrement the item quantity
        user.cartData[itemId] -= 1;

        // Remove the item from cart if quantity is zero
        if (user.cartData[itemId] === 0) {
            delete user.cartData[itemId];
        }

        // Save the updated user document
        await user.save();

        res.status(200).json({ success: true, message: 'Item removed from cart.' });
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).json({ success: false, message: 'Error in removing item from cart.' });
    }
};

/**
 * **Get User Cart Data**
 * Retrieves the current state of the user's cart with detailed product variant information, including percentDiscount.
 */
const getCart = async (req, res) => {
    try {
        const userId = req.user.id; // Obtained from verifyToken middleware

        // Find the user
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const cartData = user.cartData || {};

        // If the cart is empty, return an empty array
        if (Object.keys(cartData).length === 0) {
            return res.status(200).json({ success: true, cartItems: [] });
        }

        // Fetch all product variants in the cart
        const variantIds = Object.keys(cartData);
        const variants = await productVariantModel.find({ _id: { $in: variantIds }, active: true });

        // Fetch all products that contain these variants
        const products = await productModel.find({ variants: { $in: variantIds } }).select('name description');

        // Create a mapping of variantId to product details
        const productMap = {};
        products.forEach(product => {
            product.variants.forEach(variantId => {
                productMap[variantId.toString()] = {
                    name: product.name,
                    description: product.description,
                };
            });
        });

        // Map the variants with their quantities and calculate discount prices
        const cartItems = variants.map(variant => {
            const quantity = cartData[variant._id];
            const discountAmount = (variant.percentDiscount / 100) * variant.price;
            const discountedPrice = variant.price - discountAmount;
            return {
                variantId: variant._id,
                productName: productMap[variant._id.toString()] ? productMap[variant._id.toString()].name : 'Unknown Product',
                productDescription: productMap[variant._id.toString()] ? productMap[variant._id.toString()].description : '',
                size: variant.size,
                originalPrice: variant.price,
                percentDiscount: variant.percentDiscount,
                discountedPrice: discountedPrice.toFixed(2),
                quantity: quantity,
                images: variant.images,
            };
        });

        res.status(200).json({ success: true, cartItems });
    } catch (error) {
        console.error('Error fetching cart data:', error);
        res.status(500).json({ success: false, message: 'Error in fetching cart data.' });
    }
};

export { addToCart, removeFromCart, getCart };