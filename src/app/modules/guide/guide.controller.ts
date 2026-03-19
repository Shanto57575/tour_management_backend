import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { GuideServices } from "./guide.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import type { GuideApplicationFiles } from "./guide.interface";

const applyForGuide = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;

  const application = await GuideServices.createGuideApplication(
    user.userId,
    req.body,
    req.files as GuideApplicationFiles,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Guide application submitted successfully",
    data: application,
  });
});

const updateStatus = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const { id } = req.params;
  const { status, reason } = req.body;

  const application = await GuideServices.updateApplicationStatus(
    id,
    status,
    user.userId,
    reason,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Guide application updated successfully",
    data: application,
  });
});

const reapply = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload;
  const { id } = req.params;

  const application = await GuideServices.reapplyGuideApplication(
    id,
    user.userId,
    req.body,
    req.files as GuideApplicationFiles,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Guide application reapplied successfully",
    data: application,
  });
});

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

export const GuideController = {
  applyForGuide,
  updateStatus,
  reapply,
  getAllApplications,
  getMyApplication,
  getSingleApplication,
};
