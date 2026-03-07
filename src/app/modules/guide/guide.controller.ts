import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { GuideServices } from "./guide.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";

const applyAsGuide = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const { divisionId } = req.body;

  const application = await GuideServices.applyAsGuideService(
    user.userId,
    divisionId,
    req.file,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Guide application submitted successfully",
    data: application,
  });
});

const updateApplicationStatus = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const application = await GuideServices.updateApplicationStatusService(
      id,
      status,
      rejectionReason,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Guide application updated successfully",
      data: application,
    });
  },
);

const getAllApplications = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as Record<string, string>;
  const result = await GuideServices.getAllApplicationsService(query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Guide applications retrieved successfully",
    meta: result.meta,
    data: result.applications,
  });
});

const getMyApplication = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const application = await GuideServices.getMyApplicationService(user.userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User's guide application retrieved successfully",
    data: application,
  });
});

const getSingleApplication = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const application = await GuideServices.getSingleApplicationService(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Guide application retrieved successfully",
    data: application,
  });
});

const archiveApplication = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const application = await GuideServices.archiveApplicationService(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Guide application archived successfully",
    data: application,
  });
});

export const GuideController = {
  applyAsGuide,
  updateApplicationStatus,
  getAllApplications,
  getMyApplication,
  getSingleApplication,
  archiveApplication,
};
