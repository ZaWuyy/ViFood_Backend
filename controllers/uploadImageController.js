// controllers/uploadImageController.js
import upload from '../config/multerConfig.js';
import cloudinary from '../config/cloudinaryConfig.js';

/**
 * **Upload a Single Image**
 */
export const uploadImage = (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(500).json({ message: `Failed to upload image: ${err.message}` });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided.' });
    }
    res.status(200).json({ message: 'Image uploaded successfully', imageUrl: req.file.path });
  });
};

/**
 * **Upload Multiple Images**
 */
export const uploadImages = (req, res) => {
  upload.array('images', 10)(req, res, (err) => {
    if (err) {
      return res.status(500).json({ message: `Failed to upload images: ${err.message}` });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No image files provided.' });
    }
    const imageUrls = req.files.map(file => file.path);
    res.status(200).json({ message: 'Images uploaded successfully', imageUrls });
  });
};

/**
 * **Get Image URL by Public ID**
 * @param {string} publicId - The public ID of the image in Cloudinary.
 * @returns {string} - The URL of the image.
 */
export const getImageUrl = (publicId) => {
  return cloudinary.url(publicId, { secure: true });
};

/**
 * **Delete Image by Public ID**
 * @param {string} publicId - The public ID of the image to be deleted.
 */
export const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};

/**
 * **Update Image**
 * Deletes the old image and uploads a new one.
 */
export const updateImage = async (req, res) => {
  const { publicId } = req.body;
  if (!publicId) {
    return res.status(400).json({ message: 'Public ID of the image is required.' });
  }

  try {
    // Delete the old image
    await deleteImage(publicId);

    // Upload the new image
    upload.single('image')(req, res, (err) => {
      if (err) {
        return res.status(500).json({ message: `Failed to upload image: ${err.message}` });
      }
      if (!req.file) {
        return res.status(400).json({ message: 'No new image file provided.' });
      }
      res.status(200).json({ message: 'Image updated successfully', imageUrl: req.file.path });
    });
  } catch (error) {
    res.status(500).json({ message: `Failed to update image: ${error.message}` });
  }
};

export default { uploadImage, uploadImages, getImageUrl, deleteImage, updateImage };