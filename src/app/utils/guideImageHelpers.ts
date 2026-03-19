import httpStatus from "http-status-codes";
import AppError from "../errorHelpers/AppError";
import {
  deleteImageFromCloudinary,
  uploadBufferToCloudinary,
} from "../config/cloudinary.config";
import type { GuideApplicationFiles, GuideImageField } from "../modules/guide/guide.interface";

export const getFileFromFields = (
  files: GuideApplicationFiles | undefined,
  fieldName: GuideImageField,
) => {
  const matched = files?.[fieldName];
  if (!matched || matched.length === 0) return undefined;
  return matched[0];
};

export const uploadSingleImage = async (file: Express.Multer.File) => {
  if (!file.mimetype.startsWith("image/")) {
    throw new AppError(httpStatus.BAD_REQUEST, "Only image files are allowed");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new AppError(httpStatus.BAD_REQUEST, "Each image must be under 5MB");
  }

  const uploaded = await uploadBufferToCloudinary(file.buffer, file.originalname);

  if (!uploaded?.secure_url || !uploaded.public_id) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Image upload failed");
  }

  return {
    secureUrl: uploaded.secure_url,
    publicId: uploaded.public_id,
  };
};

const toDestroyableUrl = (publicId: string) => {
  return `https://res.cloudinary.com/dummy/image/upload/v1/${publicId}.jpg`;
};

export const cleanupCloudinaryByPublicIds = async (publicIds: string[]) => {
  const validPublicIds = publicIds.filter((item) => item.trim().length > 0);
  if (validPublicIds.length === 0) return;

  await Promise.allSettled(
    validPublicIds.map((publicId) =>
      deleteImageFromCloudinary(toDestroyableUrl(publicId)),
    ),
  );
};
