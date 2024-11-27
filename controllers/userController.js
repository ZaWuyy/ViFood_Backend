// userController.js
import userModel from "../models/userModel.js"; 
import sendEmail from "../utils/emailService.js";
import { uploadImage, deleteImage } from "../controllers/uploadImageController.js";

/**
 * **Fetch Profile**
 */
export const fetchProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id).select("-password -resetPasswordToken -resetPasswordExpires");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

/**
 * **Update Profile**
 * Handles avatar image upload and updates user profile information.
 */
export const updateProfile = async (req, res) => {
    uploadImage(req, res, async (err) => {
        if (err) {
            return res.status(500).json({ message: `Failed to upload image: ${err.message}` });
        }

        const { username, firstname, lastname, phoneNumber } = req.body;
        const userId = req.user.id;

        try {
            const user = await userModel.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found." });
            }

            // If a new avatar is uploaded, delete the old one
            if (req.file) {
                if (user.avatarUrl && user.avatarPublicId) {
                    await deleteImage(user.avatarPublicId);
                }
                user.avatarUrl = req.file.path;
                user.avatarPublicId = req.file.filename;
            }

            // Update other profile fields
            user.username = username || user.username;
            user.firstname = firstname || user.firstname;
            user.lastname = lastname || user.lastname;
            user.phoneNumber = phoneNumber || user.phoneNumber;

            await user.save();
            res.json({ message: "Profile updated successfully", user });
        } catch (error) {
            res.status(500).json({ message: `Server error: ${error.message}` });
        }
    });
};

/**
 * **Send Verification Email**
 */
export const sendVerificationEmail = async (req, res) => {
    const { newEmail } = req.body;
    const user = await userModel.findById(req.user.id);

    if (!user) {
        return res.status(404).json({ message: "User not found." });
    }

    const verificationToken = user.generateVerificationToken();
    const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}&email=${newEmail}`;
    user.emailVerificationToken = verificationToken;
    try {
        await user.save();
        await sendEmail(newEmail, "Email Verification", `Please verify your email by clicking the following link: ${verificationLink}`);

        res.json({ message: "Verification email sent." });
    } catch (error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

/**
 * **Verify Email**
 */
export const verifyEmail = async (req, res) => {
    const { token, email } = req.body;

    try {
        const user = await userModel.findOne({ emailVerificationToken: token });

        if (!user) {
            return res.status(400).json({ message: "Invalid token." });
        }

        user.email = email;
        user.emailVerificationToken = undefined;
        await user.save();

        res.json({ message: "Email verified and updated." });
    } catch (error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

/**
 * **Create a New User**
 */
export const createUser = async (req, res) => {
    const { username, email, password } = req.body;
    if (req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Unauthorized." });
    }
    try {
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "Email already exists." });
        }

        const newUser = new userModel({ username, email, password });
        await newUser.save();
        res.json({ success: true, message: "User created successfully.", user: newUser });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error creating user." });
    }
};

/**
 * **Update a User**
 */
export const updateUser = async (req, res) => {
    if (req.user.role !== "admin" && req.user.id !== req.params.id) {
        return res.status(403).json({ success: false, message: "Unauthorized." });
    }
    const { role } = req.body;
    try {
        const updatedUser = await userModel.findByIdAndUpdate(req.params.id, { role }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        res.json({ success: true, message: "User updated successfully.", user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

/**
 * **Delete a User**
 * Deletes the user's avatar from Cloudinary before removing the user from the database.
 */
export const deleteUser = async (req, res) => {
    if (req.user.role !== "admin" && req.user.id !== req.params.id) {
        return res.status(403).json({ success: false, message: "Unauthorized." });
    }
    const { id } = req.params;
    try {
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Delete avatar image from Cloudinary
        if (user.avatarPublicId) {
            await deleteImage(user.avatarPublicId);
        }

        const deletedUser = await userModel.findByIdAndDelete(id);
        res.json({ success: true, message: "User deleted successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

/**
 * **Add a Voucher to Saved Vouchers**
 */
export const addVoucher = async (req, res) => {
    const { voucherId } = req.body;
    try {
        const user = await userModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if voucher already saved
        if (user.vouchers.includes(voucherId)) {
            return res.status(400).json({ message: "Voucher already saved." });
        }

        user.vouchers.push(voucherId);
        await user.save();

        res.json({ success: true, message: "Voucher saved successfully.", vouchers: user.vouchers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

/**
 * **Remove a Voucher from Saved Vouchers**
 */
export const removeVoucher = async (req, res) => {
    const { voucherId } = req.body;
    try {
        const user = await userModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (!user.vouchers.includes(voucherId)) {
            return res.status(400).json({ message: "Voucher not found in saved list." });
        }

        user.vouchers = user.vouchers.filter(id => id.toString() !== voucherId);
        await user.save();

        res.json({ success: true, message: "Voucher removed successfully.", vouchers: user.vouchers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

/**
 * **Add a Favorite Product**
 */
export const addFavoriteProduct = async (req, res) => {
    const { productId } = req.body;
    try {
        const user = await userModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if product already favorited
        if (user.favoriteProducts.includes(productId)) {
            return res.status(400).json({ message: "Product already in favorites." });
        }

        user.favoriteProducts.push(productId);
        await user.save();

        res.json({ success: true, message: "Product added to favorites.", favoriteProducts: user.favoriteProducts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

/**
 * **Remove a Favorite Product**
 */
export const removeFavoriteProduct = async (req, res) => {
    const { productId } = req.body;
    try {
        const user = await userModel.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (!user.favoriteProducts.includes(productId)) {
            return res.status(400).json({ message: "Product not found in favorites." });
        }

        user.favoriteProducts = user.favoriteProducts.filter(id => id.toString() !== productId);
        await user.save();

        res.json({ success: true, message: "Favorite product removed successfully.", favoriteProducts: user.favoriteProducts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

export const getUser = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id).select("-password -resetPasswordToken -resetPasswordExpires");
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

export const getUsers = async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Unauthorized." });
    }
    try {
        const users = await userModel.find().select("-password -resetPasswordToken -resetPasswordExpires");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

export default { 
    createUser, 
    updateUser, 
    deleteUser, 
    getUser, 
    getUsers, 
    fetchProfile, 
    updateProfile, 
    sendVerificationEmail, 
    verifyEmail,
    addVoucher,
    removeVoucher,
    addFavoriteProduct,
    removeFavoriteProduct
};