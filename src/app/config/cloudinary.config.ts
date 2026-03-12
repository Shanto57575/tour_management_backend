/* eslint-disable @typescript-eslint/no-explicit-any */
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { envVars } from "./env";
import AppError from "../errorHelpers/AppError";
import stream from "stream";

cloudinary.config({
  cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
  api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET,
});

const buildUniqueFileName = (originalName: string) => {
  const cleaned = originalName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/\./g, "-")
    .replace(/[^a-z0-9\-.]/g, "");

  const unique =
    Math.random().toString(36).substring(2) + "-" + Date.now() + "-" + cleaned;

  return unique;
};

export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  originalName: string
): Promise<UploadApiResponse | undefined> => {
  try {
    return new Promise((resolve, reject) => {
      const fileName = buildUniqueFileName(originalName);
      const bufferStream = new stream.PassThrough();
      bufferStream.end(buffer);

      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "auto",
            folder: "uploads",
            public_id: fileName,
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result || undefined);
          }
        )
        .end(buffer);
    });
  } catch (error: any) {
    throw new AppError(
      500,
      `Error uploading buffer to cloudinary ${error.message}`
    );
  }
};

export const deleteImageFromCloudinary = async (url: string) => {
  try {
    const regex = /\/v\d+\/(.*?)\.(jpg|jpeg|png|gif|webp)$/i;
    const match = url.match(regex);

    if (match && match[1]) {
      const public_id = match[1];
      await cloudinary.uploader.destroy(public_id);
    }
  } catch (error: any) {
    throw new AppError(401, "Cloudinary Image deletion failed!", error.message);
  }
};

export const cloudinaryUpload = cloudinary;
