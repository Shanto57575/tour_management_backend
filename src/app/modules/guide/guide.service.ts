import httpStatus from "http-status-codes";
import mongoose from "mongoose";
import AppError from "../../errorHelpers/AppError";
import { uploadBufferToCloudinary } from "../../config/cloudinary.config";
import { GuideApplicationStatus } from "./guide.interface";
import { GuideApplication } from "./guide.model";
import { User } from "../user/user.model";
import { Role } from "../user/user.interface";
import { QueryBuilder } from "../../utils/queryBuilder";

/**
 * Apply as a guide.
 * Validates if the user already has a pending application to prevent duplicates.
 * Uploads NID photo to Cloudinary and saves the application model.
 */
const applyAsGuideService = async (
  userId: string,
  divisionId: string,
  file?: Express.Multer.File,
) => {
  if (!file) {
    throw new AppError(httpStatus.BAD_REQUEST, "NID photo is required");
  }

  // Check if user has a PENDING application
  const existingPending = await GuideApplication.findOne({
    user: userId,
    status: GuideApplicationStatus.PENDING,
  });

  if (existingPending) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You already have a pending guide application",
    );
  }

  // Upload to cloudinary
  const nidPhoto = await uploadBufferToCloudinary(
    file.buffer,
    file.originalname,
  );

  if (!nidPhoto || !nidPhoto.secure_url) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to upload NID photo",
    );
  }

  // Create the application
  const application = await GuideApplication.create({
    user: userId,
    division: divisionId,
    nidPhoto: nidPhoto.secure_url,
    status: GuideApplicationStatus.PENDING,
  });

  return application;
};

/**
 * Update guide application status.
 * Uses a MongoDB transaction to update the status and, if APPROVED, promotes the user to GUIDE role.
 */
const updateApplicationStatusService = async (
  applicationId: string,
  status: GuideApplicationStatus,
  rejectionReason?: string,
) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const application =
      await GuideApplication.findById(applicationId).session(session);

    if (!application) {
      throw new AppError(httpStatus.NOT_FOUND, "Guide application not found");
    }

    if (
      application.status === GuideApplicationStatus.APPROVED ||
      application.status === GuideApplicationStatus.ARCHIVED
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Cannot change status of an application that is already ${application.status}`,
      );
    }

    // Update application
    application.status = status;
    if (status === GuideApplicationStatus.REJECTED && rejectionReason) {
      application.rejectionReason = rejectionReason;
    }

    await application.save({ session });

    // If approved, update the User's role
    if (status === GuideApplicationStatus.APPROVED) {
      const user = await User.findById(application.user).session(session);
      if (!user) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          "User associated with application not found",
        );
      }

      // Promote to Guide (if they aren't already admins/super admins)
      if (user.role === Role.USER) {
        user.role = Role.GUIDE;
        await user.save({ session });
      }
    }

    await session.commitTransaction();
    await session.endSession();

    return application;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

/**
 * Get all guide applications with pagination, searching, and filtering.
 */
const getAllApplicationsService = async (query: Record<string, string>) => {
  const guideSearchableFields = ["status"]; // Removed 'division' because Mongoose throws "Can't use $options" on ObjectId regex search

  const queryBuilder = new QueryBuilder(
    GuideApplication.find()
      .populate("user", "name email")
      .populate("division", "name"),
    query,
  );

  const applications = queryBuilder
    .filter()
    .search(guideSearchableFields)
    .sort()
    .paginate();

  const [data, meta] = await Promise.all([
    applications.build(),
    queryBuilder.getMeta(),
  ]);

  return {
    meta,
    applications: data,
  };
};

/**
 * Get the currently authenticated user's active guide application.
 */
const getMyApplicationService = async (userId: string) => {
  const application = await GuideApplication.find({ user: userId })
    .populate("division", "name")
    .sort({ createdAt: -1 });

  return application;
};

/**
 * Archive a guide application (soft delete).
 */
const archiveApplicationService = async (applicationId: string) => {
  const application = await GuideApplication.findByIdAndUpdate(
    applicationId,
    { status: GuideApplicationStatus.ARCHIVED },
    { new: true },
  );

  if (!application) {
    throw new AppError(httpStatus.NOT_FOUND, "Guide application not found");
  }

  return application;
};

/**
 * Get single application details.
 */
const getSingleApplicationService = async (applicationId: string) => {
  const application = await GuideApplication.findById(applicationId)
    .populate("user", "name email picture phone")
    .populate("division", "name");

  if (!application) {
    throw new AppError(httpStatus.NOT_FOUND, "Guide application not found");
  }

  return application;
};

export const GuideServices = {
  applyAsGuideService,
  updateApplicationStatusService,
  getAllApplicationsService,
  archiveApplicationService,
  getSingleApplicationService,
  getMyApplicationService,
};
