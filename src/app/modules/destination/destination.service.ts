import { deleteImageFromCloudinary } from "../../config/cloudinary.config";
import AppError from "../../errorHelpers/AppError";
import { QueryBuilder } from "../../utils/queryBuilder";
import { IDestination } from "./destination.interface";
import { Destination } from "./destination.model";
import httpStatus from "http-status-codes";

export const destinationSearchableFields = ["name", "description", "summary", "district"];

const createDestinationService = async (payload: Partial<IDestination>) => {
  const isDestinationExists = await Destination.findOne({ name: payload.name });

  if (isDestinationExists) {
    throw new AppError(httpStatus.BAD_REQUEST, "Destination already exists!");
  }

  const destinationInfo = await Destination.create(payload);
  return destinationInfo;
};

const getAllDestinationService = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(
    Destination.find().populate("division"),
    query,
  );
  const destinations = queryBuilder
    .filter()
    .search(destinationSearchableFields)
    .fields()
    .sort()
    .paginate();

  const [data, meta] = await Promise.all([
    destinations.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    meta,
    destinations: data,
  };
};

const getSingleDestinationService = async (slug: string) => {
  return await Destination.findOne({ slug }).populate("division").lean();
};

type UpdateDestinationPayload = Partial<IDestination> & {
  deleteImageUrls?: string[];
  newImages?: string[];
};

const updateDestinationService = async (
  destinationId: string,
  payload: UpdateDestinationPayload,
) => {
  const isDestinationExist = await Destination.findById(destinationId);

  if (!isDestinationExist) {
    throw new AppError(httpStatus.NOT_FOUND, "Destination Not Found");
  }

  const { deleteImageUrls, newImages, ...rest } = payload;

  // Delete requested images from Cloudinary
  if (deleteImageUrls?.length) {
    await Promise.all(deleteImageUrls.map((url) => deleteImageFromCloudinary(url)));
  }

  // Build updated images array: remove deleted, then append new
  const existingImages = isDestinationExist.images ?? [];
  const keptImages = deleteImageUrls?.length
    ? existingImages.filter((url) => !deleteImageUrls.includes(url))
    : existingImages;
  const updatedImages = newImages?.length ? [...keptImages, ...newImages] : keptImages;

  const updatedDestinationInfo = await Destination.findByIdAndUpdate(
    destinationId,
    { ...rest, images: updatedImages },
    { new: true },
  );

  return updatedDestinationInfo;
};

const deleteDestinationService = async (destinationId: string) => {
  const isDestinationExist = await Destination.findById(destinationId);

  if (!isDestinationExist) {
    throw new AppError(httpStatus.NOT_FOUND, "Destination Not Found");
  }

  if (isDestinationExist.images?.length) {
    await Promise.all(
      isDestinationExist.images.map((url) => deleteImageFromCloudinary(url)),
    );
  }

  return await Destination.findByIdAndDelete(destinationId);
};

export const DestinationService = {
  createDestinationService,
  getAllDestinationService,
  getSingleDestinationService,
  updateDestinationService,
  deleteDestinationService,
};
