import { deleteImageFromCloudinary } from "../../config/cloudinary.config";
import AppError from "../../errorHelpers/AppError";
import { QueryBuilder } from "../../utils/queryBuilder";
import { tourSearchableFields } from "./tour.constant";
import { ITour, ITourType } from "./tour.interface";
import { Tour, TourType } from "./tour.model";
import httpStatus from "http-status-codes";

const createTourTypeService = async (payload: ITourType) => {
  const isTourTypeExists = await TourType.findOne({ payload });

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
  payload: ITourType
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
  const tourInfo = await Tour.create(payload);
  return tourInfo;
};

const getAllTourService = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Tour.find(), query);
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
  return await Tour.findOne({ slug });
};

const updateTourService = async (tourId: string, payload: Partial<ITour>) => {
  const isTourExist = await Tour.findById(tourId);

  if (!isTourExist) {
    throw new AppError(httpStatus.NOT_FOUND, "Tour Not Found");
  }

  // option : 1
  // if (
  //   payload.images &&
  //   payload.images.length > 0 &&
  //   isTourExist.images &&
  //   isTourExist.images.length > 0
  // ) {
  //   payload.images = [...payload.images, ...isTourExist.images];
  // }

  // option : 2 (here if adding new image we must keep the previous images too)
  payload.images = [...(payload.images || []), ...(isTourExist.images || [])];

  if (payload.deleteImages && isTourExist.images) {
    const restDbImages = isTourExist.images.filter(
      (imageUrl) => !(payload.images || [])?.includes(imageUrl)
    );

    const updatedPayloadImages = (payload.images || [])
      .filter((imageUrl) => !payload.deleteImages?.includes(imageUrl))
      .filter((imageUrl) => !restDbImages.includes(imageUrl));

    payload.images = [...restDbImages, ...updatedPayloadImages];
  }

  const updatedTourInfo = await Tour.findByIdAndUpdate(tourId, payload, {
    new: true,
  });

  if (payload.deleteImages && isTourExist.images) {
    await Promise.all(
      payload.deleteImages.map((url) => deleteImageFromCloudinary(url))
    );
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
