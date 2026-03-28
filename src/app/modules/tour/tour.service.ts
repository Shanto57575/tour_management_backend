import { deleteImageFromCloudinary } from "../../config/cloudinary.config";
import AppError from "../../errorHelpers/AppError";
import { QueryBuilder } from "../../utils/queryBuilder";
import { tourSearchableFields } from "./tour.constant";
import { ITour, ITourType } from "./tour.interface";
import { Tour, TourType } from "./tour.model";
import httpStatus from "http-status-codes";
import { Role } from "../user/user.interface";
import { TourLifecycle } from "./tour.lifecycle";
import { GuideProfile } from "../guide/guideProfile/guideProfile.model";

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
  const sanitized = sanitizeTourPayload(payload);
  const guideUserId = sanitized.guide ? String(sanitized.guide) : null;

  if (guideUserId) {
    const guideProfile = await GuideProfile.findOne({
      user: guideUserId,
      isActive: true,
      isAvailable: true,
      ongoingTourId: null,
    });
    if (!guideProfile) {
      throw new AppError(httpStatus.BAD_REQUEST, "Selected guide is not available for assignment");
    }
  }

  const tourInfo = await Tour.create(sanitized);

  if (guideUserId) {
    await GuideProfile.updateOne(
      { user: guideUserId },
      { $set: { ongoingTourId: tourInfo._id, isAvailable: false } },
    );
  }

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

const updateTourService = async (
  tourId: string,
  payload: ITourUpdatePayload,
  actorRole?: Role,
) => {
  const sanitizedPayload = sanitizeTourPayload(payload) as ITourUpdatePayload;
  const isTourExist = await Tour.findById(tourId);

  if (!isTourExist) {
    throw new AppError(httpStatus.NOT_FOUND, "Tour Not Found");
  }

  const isPrivilegedAdminActor =
    actorRole === Role.ADMIN || actorRole === Role.SUPER_ADMIN;
  const lifecycle = TourLifecycle.resolveTourLifecycleState(
    isTourExist.startDate,
    isTourExist.endDate,
  );

  if (isPrivilegedAdminActor && lifecycle.phase === "running") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Running tours cannot be updated by admin or super admin",
    );
  }

  const existingImages = (isTourExist.images || []).filter(
    (img): img is string => typeof img === "string" && img.trim().length > 0,
  );
  const newImages = (sanitizedPayload.images || []).filter(
    (img): img is string => typeof img === "string" && img.trim().length > 0,
  );
  const deleteImages = (sanitizedPayload.deleteImages || []).filter(
    (img): img is string => typeof img === "string" && img.trim().length > 0,
  );

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

  // ─── Guide assignment lock/unlock ─────────────────────────────────────────
  const previousGuideId = isTourExist.guide ? String(isTourExist.guide) : null;
  const isGuideInPayload = "guide" in sanitizedPayload;
  const newGuideId = isGuideInPayload
    ? sanitizedPayload.guide ? String(sanitizedPayload.guide) : null
    : previousGuideId;
  const isGuideChanging = isGuideInPayload && newGuideId !== previousGuideId;

  if (isGuideChanging && newGuideId) {
    const guideProfile = await GuideProfile.findOne({
      user: newGuideId,
      isActive: true,
      isAvailable: true,
      ongoingTourId: null,
    });
    if (!guideProfile) {
      throw new AppError(httpStatus.BAD_REQUEST, "Selected guide is not available for assignment");
    }
  }

  const updatedTourInfo = await Tour.findByIdAndUpdate(tourId, sanitizedPayload, {
    new: true,
  });

  if (isGuideChanging) {
    if (previousGuideId) {
      await GuideProfile.updateOne(
        { user: previousGuideId },
        { $set: { ongoingTourId: null, isAvailable: true } },
      );
    }
    if (newGuideId) {
      await GuideProfile.updateOne(
        { user: newGuideId },
        { $set: { ongoingTourId: tourId, isAvailable: false } },
      );
    }
  }

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
