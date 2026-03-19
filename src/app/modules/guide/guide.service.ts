import httpStatus from "http-status-codes";
import mongoose from "mongoose";
import AppError from "../../errorHelpers/AppError";
import {
  GuideApplicationStatus,
  type GuideApplicationFiles,
  type GuideApplicationPayload,
  type GuideImageField,
} from "./guide.interface";
import { GuideApplication } from "./guide.model";
import { User } from "../user/user.model";
import { Role } from "../user/user.interface";
import { QueryBuilder } from "../../utils/queryBuilder";
import {
  APPLICATION_FIELD_KEYS,
  GUIDE_SEARCHABLE_FIELDS,
  IMAGE_PUBLIC_ID_MAP,
  REQUIRED_IMAGE_FIELDS,
} from "./guide.constant";
import {
  cleanupCloudinaryByPublicIds,
  getFileFromFields,
  uploadSingleImage,
} from "../../utils/guideImageHelpers";

const createGuideApplication = async (
  userId: string,
  payload: GuideApplicationPayload,
  files?: GuideApplicationFiles,
) => {
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

  const createPayload: Record<string, unknown> = {
    user: userId,
    status: GuideApplicationStatus.PENDING,
    submittedAt: new Date(),
    statusHistory: [
      {
        status: GuideApplicationStatus.PENDING,
        reason: null,
        changedBy: userId,
        changedAt: new Date(),
      },
    ],
  };

  APPLICATION_FIELD_KEYS.forEach((key) => {
    const value = payload[key];
    if (value !== undefined) {
      createPayload[key] = value;
    }
  });

  for (const imageField of Object.keys(IMAGE_PUBLIC_ID_MAP) as GuideImageField[]) {
    const imageFile = getFileFromFields(files, imageField);

    if (imageFile) {
      const uploaded = await uploadSingleImage(imageFile);
      createPayload[imageField] = uploaded.secureUrl;
      createPayload[IMAGE_PUBLIC_ID_MAP[imageField]] = uploaded.publicId;
      continue;
    }

    const imageFromPayload = payload[imageField];
    const publicIdFromPayload = payload[IMAGE_PUBLIC_ID_MAP[imageField]];

    if (imageFromPayload !== undefined) {
      createPayload[imageField] = imageFromPayload;
    }

    if (publicIdFromPayload !== undefined) {
      createPayload[IMAGE_PUBLIC_ID_MAP[imageField]] = publicIdFromPayload;
    }
  }

  for (const requiredImageField of REQUIRED_IMAGE_FIELDS) {
    if (!createPayload[requiredImageField]) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `${requiredImageField} is required`,
      );
    }
  }

  const application = await GuideApplication.create(createPayload);

  return application;
};

const updateApplicationStatus = async (
  applicationId: string,
  newStatus: GuideApplicationStatus,
  changedBy: string,
  reason?: string,
) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const application = await GuideApplication.findOne({
      _id: applicationId,
      status: GuideApplicationStatus.PENDING,
    }).session(session);

    if (!application) {
      const existingApplication = await GuideApplication.findById(applicationId).session(
        session,
      );
      if (!existingApplication) {
        throw new AppError(httpStatus.NOT_FOUND, "Guide application not found");
      }

      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Status can only be changed from PENDING, current status is ${existingApplication.status}`,
      );
    }

    if (newStatus === GuideApplicationStatus.PENDING) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Cannot set PENDING through admin status update",
      );
    }

    if (
      newStatus === GuideApplicationStatus.REJECTED &&
      (!reason || reason.trim().length === 0)
    ) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Reason is required when rejecting an application",
      );
    }

    const setFields: Record<string, unknown> = {
      status: newStatus,
    };
    const updateQuery: {
      $set: Record<string, unknown>;
      $push: {
        statusHistory: {
          status: GuideApplicationStatus;
          reason: string | null;
          changedBy: string;
          changedAt: Date;
        };
      };
    } = {
      $set: setFields,
      $push: {
        statusHistory: {
          status: newStatus,
          reason: reason ?? null,
          changedBy,
          changedAt: new Date(),
        },
      },
    };

    const updatedApplication = await GuideApplication.findOneAndUpdate(
      {
        _id: applicationId,
        status: GuideApplicationStatus.PENDING,
      },
      updateQuery,
      { new: true, session },
    );

    if (!updatedApplication) {
      throw new AppError(
        httpStatus.CONFLICT,
        "Application status was already updated by another request",
      );
    }

    if (newStatus === GuideApplicationStatus.APPROVED) {
      const user = await User.findById(application.user).session(session);
      if (!user) {
        throw new AppError(
          httpStatus.NOT_FOUND,
          "User associated with application not found",
        );
      }

      if (user.role === Role.USER) {
        user.role = Role.GUIDE;
        await user.save({ session });
      }
    }

    await session.commitTransaction();
    await session.endSession();

    return updatedApplication;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }
};

const reapplyGuideApplication = async (
  applicationId: string,
  userId: string,
  newData: Partial<GuideApplicationPayload>,
  files?: GuideApplicationFiles,
) => {
  const session = await mongoose.startSession();
  const uploadedPublicIds: string[] = [];
  const oldPublicIdsToDeleteAfterCommit: string[] = [];

  try {
    session.startTransaction();

    const application = await GuideApplication.findOne({
      _id: applicationId,
      user: userId,
      status: GuideApplicationStatus.REJECTED,
    }).session(session);

    if (!application) {
      const existingApplication = await GuideApplication.findById(applicationId).session(
        session,
      );

      if (!existingApplication) {
        throw new AppError(httpStatus.NOT_FOUND, "Guide application not found");
      }

      if (String(existingApplication.user) !== userId) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "You are not allowed to reapply this application",
        );
      }

      throw new AppError(
        httpStatus.BAD_REQUEST,
        "You can only reapply when the application is REJECTED",
      );
    }

    const setFields: Record<string, unknown> = {
      status: GuideApplicationStatus.PENDING,
      submittedAt: new Date(),
    };

    APPLICATION_FIELD_KEYS.forEach((key) => {
      const value = newData[key];
      if (value !== undefined) {
        setFields[key] = value;
      }
    });

    for (const imageField of Object.keys(IMAGE_PUBLIC_ID_MAP) as GuideImageField[]) {
      const imageFile = getFileFromFields(files, imageField);
      const publicIdField = IMAGE_PUBLIC_ID_MAP[imageField];

      if (imageFile) {
        const oldPublicId = application[publicIdField];
        if (typeof oldPublicId === "string" && oldPublicId.length > 0) {
          oldPublicIdsToDeleteAfterCommit.push(oldPublicId);
        }

        const uploaded = await uploadSingleImage(imageFile);
        uploadedPublicIds.push(uploaded.publicId);
        setFields[imageField] = uploaded.secureUrl;
        setFields[publicIdField] = uploaded.publicId;
        continue;
      }

      const imageFromPayload = newData[imageField];
      const publicIdFromPayload = newData[publicIdField];

      if (imageFromPayload !== undefined) {
        setFields[imageField] = imageFromPayload;
      }
      if (publicIdFromPayload !== undefined) {
        setFields[publicIdField] = publicIdFromPayload;
      }
    }

    const updatedApplication = await GuideApplication.findOneAndUpdate(
      {
        _id: applicationId,
        user: userId,
        status: GuideApplicationStatus.REJECTED,
      },
      {
        $set: setFields,
        $inc: { resubmissionCount: 1 },
        $push: {
          statusHistory: {
            status: GuideApplicationStatus.PENDING,
            reason: null,
            changedBy: userId,
            changedAt: new Date(),
          },
        },
      },
      { new: true, session },
    );

    if (!updatedApplication) {
      throw new AppError(
        httpStatus.CONFLICT,
        "Application status was already updated by another request",
      );
    }

    await session.commitTransaction();
    await session.endSession();

    await cleanupCloudinaryByPublicIds(oldPublicIdsToDeleteAfterCommit);

    return updatedApplication;
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();

    await cleanupCloudinaryByPublicIds(uploadedPublicIds);
    throw error;
  }
};

/**
 * Get all guide applications with pagination, searching, and filtering.
 */
const getAllApplicationsService = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(
    GuideApplication.find()
      .populate("user", "name email")
      .populate("division", "name")
      .populate("district", "name")
      .populate("statusHistory.changedBy", "name email"),
    query,
  );

  const applications = queryBuilder
    .filter()
    .search([...GUIDE_SEARCHABLE_FIELDS])
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


const getMyApplicationService = async (userId: string) => {
  const application = await GuideApplication.find({ user: userId })
    .populate("division", "name")
    .populate("district", "name")
    .populate("statusHistory.changedBy", "name email")
    .sort({ createdAt: -1 });

  return application;
};

const getSingleApplicationService = async (applicationId: string) => {
  const application = await GuideApplication.findById(applicationId)
    .populate("user", "name email picture phone")
    .populate("division", "name")
    .populate("district", "name")
    .populate("statusHistory.changedBy", "name email");

  if (!application) {
    throw new AppError(httpStatus.NOT_FOUND, "Guide application not found");
  }

  return application;
};

export const GuideServices = {
  createGuideApplication,
  updateApplicationStatus,
  reapplyGuideApplication,
  getAllApplicationsService,
  getSingleApplicationService,
  getMyApplicationService,
};
