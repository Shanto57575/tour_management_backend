import { deleteImageFromCloudinary } from "../../config/cloudinary.config";
import AppError from "../../errorHelpers/AppError";
import { QueryBuilder } from "../../utils/queryBuilder";
import { tourSearchableFields } from "./tour.constant";
import { ITour, ITourType } from "./tour.interface";
import { Tour, TourType } from "./tour.model";
import httpStatus from "http-status-codes";

const sanitizeTourPayload = (payload: Partial<ITour>) => {
  const sanitizedPayload = { ...payload };

  delete sanitizedPayload.bookedCount;
  delete sanitizedPayload.averageRating;
  delete sanitizedPayload.totalReviews;

  return sanitizedPayload;
};

const createTourTypeService = async (payload: ITourType) => {
  const isTourTypeExists = await TourType.findOne({ name: payload.name });

  if (isTourTypeExists) {
    throw new AppError(httpStatus.BAD_REQUEST, "Tour Type already exists!");
  }

  const newTourType = await TourType.create(payload);

  return newTourType;
};

const getAllTourTypeService = async () => {
  return await TourType.find().sort({ createdAt: -1 });
};

const getSingleTourTypeService = async (tourTypeId: string) => {
  return await TourType.findById(tourTypeId);
};

const updateTourTypeService = async (
  tourTypeId: string,
  payload: ITourType,
) => {
  const updateTourType = await TourType.findByIdAndUpdate(tourTypeId, payload, {
    new: true,
  });

  if (!updateTourType) {
    throw new AppError(httpStatus.NOT_FOUND, "Tour Type Not Found!");
  }

  return updateTourType;
};

const deleteTourTypeService = async (tourTypeId: string) => {
  const deleteTourType = await TourType.findByIdAndDelete(tourTypeId);

  if (!deleteTourType) {
    throw new AppError(httpStatus.NOT_FOUND, "Tour Type Not Found!");
  }

  return deleteTourType;
};

const createTourService = async (payload: Partial<ITour>) => {
  const tourInfo = await Tour.create(sanitizeTourPayload(payload));
  return tourInfo;
};

const getAllTourService = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(
    Tour.find()
      .populate("destination")
      .populate("division")
      .populate("district")
      .populate("guide", "name email picture")
      .populate("tourType"),
    query,
  );
  const tours = queryBuilder
    .filter()
    .search(tourSearchableFields)
    .fields()
    .sort()
    .paginate();

  const [data, meta] = await Promise.all([
    tours.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    meta,
    tours: data,
  };
};

const getSingleTourService = async (slug: string) => {
  return await Tour.findOne({ slug })
    .populate("destination")
    .populate("division")
    .populate("district")
    .populate("guide", "name email picture")
    .populate("tourType")
    .lean();
};

interface ITourUpdatePayload extends Partial<ITour> {
  deleteImages?: string[];
}

const updateTourService = async (tourId: string, payload: ITourUpdatePayload) => {
  const sanitizedPayload = sanitizeTourPayload(payload) as ITourUpdatePayload;
  const isTourExist = await Tour.findById(tourId);

  if (!isTourExist) {
    throw new AppError(httpStatus.NOT_FOUND, "Tour Not Found");
  }

  const existingImages = isTourExist.images || [];
  const newImages = sanitizedPayload.images || [];
  const deleteImages = sanitizedPayload.deleteImages || [];

  sanitizedPayload.images = [
    ...existingImages.filter((url) => !deleteImages.includes(url)),
    ...newImages,
  ];

  delete sanitizedPayload.deleteImages;

  if (
    typeof sanitizedPayload.maxGuest === "number" &&
    typeof isTourExist.bookedCount === "number"
  ) {
    sanitizedPayload.isAvailable = isTourExist.bookedCount < sanitizedPayload.maxGuest;
  }

  const updatedTourInfo = await Tour.findByIdAndUpdate(tourId, sanitizedPayload, {
    new: true,
  });

  if (deleteImages.length > 0) {
    await Promise.all(deleteImages.map((url) => deleteImageFromCloudinary(url)));
  }

  return updatedTourInfo;
};

const deleteTourService = async (tourId: string) => {
  return await Tour.findByIdAndDelete(tourId);
};

export const TourService = {
  // Tour Type
  createTourTypeService,
  updateTourTypeService,
  getAllTourTypeService,
  getSingleTourTypeService,
  deleteTourTypeService,

  // TOUR
  createTourService,
  getAllTourService,
  getSingleTourService,
  updateTourService,
  deleteTourService,
};
