import httpStatus from "http-status-codes";
import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { DestinationService } from "./destination.service";
import { uploadBufferToCloudinary } from "../../config/cloudinary.config";

const createDestination = catchAsync(async (req: Request, res: Response) => {
  const payload = { ...req.body };

  const files = req.files as Express.Multer.File[];
  if (files?.length) {
    const uploadResults = await Promise.all(
      files.map((f) => uploadBufferToCloudinary(f.buffer, f.originalname)),
    );
    payload.images = uploadResults
      .filter((r): r is NonNullable<typeof r> => r != null)
      .map((r) => r.secure_url);
  }

  const destinationInfo =
    await DestinationService.createDestinationService(payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Destination created successfully",
    data: destinationInfo,
  });
});

const getAllDestinations = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const allDestinationInfo = await DestinationService.getAllDestinationService(
    query as Record<string, string>,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All destinations retrieved successfully",
    data: allDestinationInfo,
  });
});

const getSingleDestination = catchAsync(async (req: Request, res: Response) => {
  const destination = await DestinationService.getSingleDestinationService(
    req.params.slug,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Destination retrieved successfully",
    data: destination,
  });
});

const updateDestination = catchAsync(async (req: Request, res: Response) => {
  const payload = { ...req.body };

  const files = req.files as Express.Multer.File[];
  if (files?.length) {
    const uploadResults = await Promise.all(
      files.map((f) => uploadBufferToCloudinary(f.buffer, f.originalname)),
    );
    payload.newImages = uploadResults
      .filter((r): r is NonNullable<typeof r> => r != null)
      .map((r) => r.secure_url);
  }

  const updatedDestination = await DestinationService.updateDestinationService(
    req.params.id,
    payload,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Destination updated successfully",
    data: updatedDestination,
  });
});

const deleteDestination = catchAsync(async (req: Request, res: Response) => {
  await DestinationService.deleteDestinationService(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Destination deleted successfully",
    data: null,
  });
});

export const DestinationController = {
  createDestination,
  getAllDestinations,
  getSingleDestination,
  updateDestination,
  deleteDestination,
};
