import cloudinary from "../config/cloudinary.js";
import fs from "fs";

/**
 * Upload file to Cloudinary
 * @param {string} filePath - Local file path
 * @param {string} folder - Cloudinary folder name
 * @param {string} resourceType - Type of resource (image, video, raw)
 * @returns {Promise<Object>} Cloudinary upload response
 */
export const uploadToCloudinary = async (
  filePath,
  folder = "ghostchat",
  resourceType = "image"
) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: resourceType,
      overwrite: false,
      use_filename: true,
      unique_filename: true,
    });

    // Delete local file after successful upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      size: result.bytes,
    };
  } catch (error) {
    // Clean up local file on error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    console.error("Cloudinary upload error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Cloudinary delete response
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: true,
      result,
    };
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Generate optimized Cloudinary URL
 * @param {string} url - Original Cloudinary URL
 * @param {Object} options - Transformation options
 * @returns {string} Optimized URL
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  const {
    width = 200,
    height = 200,
    crop = "fill",
    quality = "auto",
    fetch_format = "auto",
  } = options;

  // If not a Cloudinary URL, return as-is
  if (!url || !url.includes("cloudinary")) {
    return url;
  }

  // Extract public ID from URL and rebuild with transformations
  const urlParts = url.split("/upload/");
  if (urlParts.length === 2) {
    const transformations = `w_${width},h_${height},c_${crop},q_${quality},f_${fetch_format}`;
    return `${urlParts[0]}/upload/${transformations}/${urlParts[1]}`;
  }

  return url;
};
