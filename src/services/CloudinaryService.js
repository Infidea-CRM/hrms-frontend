// services/CloudinaryService.js

/**
 * Upload an image to Cloudinary via the Upload API
 * @param {File} file - The file to upload
 * @param {String} folderName - The folder to upload to (e.g., 'products', 'profiles')
 * @param {String} publicId - The public ID to use for the image
 * @returns {Promise<Object>} - The Cloudinary upload result
 */
export const uploadImage = async (file, folderName, publicId) => {
  try {
    if (!file) return null;

    // Create a FormData instance
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      import.meta.env.VITE_APP_CLOUDINARY_UPLOAD_PRESET
    );

    if (folderName) {
      formData.append("folder", folderName);
    }

    if (publicId) {
      formData.append("public_id", publicId);
    }

    // Make the upload request to Cloudinary's upload endpoint
    const cloudName = import.meta.env.VITE_APP_CLOUD_NAME;
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to upload image");
    }

    const result = await response.json();

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw new Error("Failed to upload image: " + error.message);
  }
};

/**
 * Delete an image from Cloudinary
 * @param {String} publicId - The public ID of the image to delete
 * @returns {Promise<Object>} - The delete result
 */
export const deleteImage = async (publicId) => {
  try {
    if (!publicId) return null;

    const cloudName = import.meta.env.VITE_APP_CLOUD_NAME;
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = await generateSignature(publicId, timestamp);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          public_id: publicId,
          signature: signature,
          api_key: import.meta.env.VITE_APP_CLOUDINARY_API_KEY,
          timestamp: timestamp,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to delete image");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error);
    throw new Error("Failed to delete image: " + error.message);
  }
};

/**
 * Generate a signature for Cloudinary API calls
 * @param {String} publicId - The public ID of the image
 * @param {Number} timestamp - Current timestamp
 * @returns {String} - The generated signature
 */
const generateSignature = async (publicId, timestamp) => {
  const signatureParams = {
    public_id: publicId,
    timestamp: timestamp,
  };

  const signatureString = Object.keys(signatureParams)
    .sort()
    .map((key) => `${key}=${signatureParams[key]}`)
    .join("&");

  const signature = await crypto.subtle.digest(
    "SHA-1",
    new TextEncoder().encode(
      signatureString + import.meta.env.VITE_APP_CLOUDINARY_API_SECRET
    )
  );

  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export default {
  uploadImage,
  deleteImage,
};
