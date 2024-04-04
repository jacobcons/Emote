import { remove } from 'fs-extra/esm';
import { createError } from '../utils/errors.utils.js';
import { MAX_UPLOAD_SIZE_MB } from '../constants.js';
import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (req, res) => {
  const { image } = req.files;
  const { tempFilePath } = image;

  if (!image) {
    await remove(tempFilePath);
    throw createError(400, 'No image field provided');
  }

  if (!image.mimetype.startsWith('image')) {
    await remove(tempFilePath);
    throw createError(400, 'Upload must be an image ');
  }

  if (image.truncated) {
    await remove(tempFilePath);
    throw createError(400, `Upload cannot exceed ${MAX_UPLOAD_SIZE_MB}MB`);
  }

  try {
    const result = await cloudinary.uploader.upload(tempFilePath, {
      folder: 'Emote',
    });
    await remove(tempFilePath);
    return res.json({ url: result.secure_url });
  } catch (err) {
    await remove(tempFilePath);
    throw err;
  }
};
