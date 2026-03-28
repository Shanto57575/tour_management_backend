/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { TourService } from "./tour.service";
import { uploadBufferToCloudinary } from "../../config/cloudinary.config";
import { Role } from "../user/user.interface";

const createTourType = catchAsync(async (req: Request, res: Response) => {
  const tourTypeInfo = await TourService.createTourTypeService(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "New TourType created successfully",
    data: tourTypeInfo,
  });
});

const getAllTourTypes = catchAsync(async (_req: Request, res: Response) => {
  const tourTypeInfo = await TourService.getAllTourTypeService();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All TourType retrieved successfully",
    data: tourTypeInfo,
  });
});

const getSingleTourType = catchAsync(async (req: Request, res: Response) => {
  const tourType = await TourService.getSingleTourTypeService(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "TourType retrieved successfully",
    data: tourType,
  });
});

const updateTourType = catchAsync(async (req: Request, res: Response) => {
  const updatedTourTypeInfo = await TourService.updateTourTypeService(
    req.params.id,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "TourType updated successfully",
    data: updatedTourTypeInfo,
  });
});

const deleteTourType = catchAsync(async (req: Request, res: Response) => {
  await TourService.deleteTourTypeService(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "TourType deleted successfully",
    data: null,
  });
});

const createTour = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  let uploadedImages: string[] | undefined;

  if (files?.length) {
    const uploadResults = await Promise.all(
      files.map((f) => uploadBufferToCloudinary(f.buffer, f.originalname)),
    );

    uploadedImages = uploadResults
      .filter((r): r is NonNullable<typeof r> => r != null)
      .map((r) => r.secure_url);
  }

  const payload = {
    ...req.body,
    images: uploadedImages,
  };
  const tourInfo = await TourService.createTourService(payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Tour created successfully",
    data: tourInfo,
  });
});

const getAllTour = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const allTourInfo = await TourService.getAllTourService(
    query as Record<string, string>
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All tours retrieved successfully",
    data: allTourInfo,
  });
});

const getSingleTour = catchAsync(async (req: Request, res: Response) => {
  const tour = await TourService.getSingleTourService(req.params.slug);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Tour retrieved successfully",
    data: tour,
  });
});

const updateTour = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  let uploadedImages: string[] | undefined;

  if (files?.length) {
    const uploadResults = await Promise.all(
      files.map((f) => uploadBufferToCloudinary(f.buffer, f.originalname)),
    );

    uploadedImages = uploadResults
      .filter((r): r is NonNullable<typeof r> => r != null)
      .map((r) => r.secure_url);
  }

  const payload = {
    ...req.body,
    images: uploadedImages,
  };
  const updatedTour = await TourService.updateTourService(
    req.params.id,
    payload,
    (req.user as { role?: Role } | undefined)?.role,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Tour updated successfully",
    data: updatedTour,
  });
});

const deleteTour = catchAsync(async (req: Request, res: Response) => {
  await TourService.deleteTourService(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Tour deleted successfully",
    data: null,
  });
});

export const TourController = {
  // Tour Type
  createTourType,
  getAllTourTypes,
  getSingleTourType,
  updateTourType,
  deleteTourType,

  // Tour
  createTour,
  getAllTour,
  getSingleTour,
  updateTour,
  deleteTour,
};
