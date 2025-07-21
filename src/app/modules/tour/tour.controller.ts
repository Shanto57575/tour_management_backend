/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { TourService } from "./tour.service";

const createTourType = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tourTypeInfo = await TourService.createTourTypeService(req.body);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "New TourType created successfully",
      data: tourTypeInfo,
    });
  }
);

const getAllTourTypes = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tourTypeInfo = await TourService.getAllTourTypeService();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All TourType retrieved successfully",
      data: tourTypeInfo,
    });
  }
);

const getSingleTourType = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tourType = await TourService.getSingleTourTypeService(req.params.id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "TourType retrieved successfully",
      data: tourType,
    });
  }
);

const updateTourType = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
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
  }
);

const deleteTourType = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await TourService.deleteTourTypeService(req.params.id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "TourType deleted successfully",
      data: null,
    });
  }
);

const createTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tourInfo = await TourService.createTourService(req.body);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Tour created successfully",
      data: tourInfo,
    });
  }
);

const getAllTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
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
  }
);

const getSingleTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tour = await TourService.getSingleTourService(req.params.slug);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Tour retrieved successfully",
      data: tour,
    });
  }
);

const updateTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const updatedTour = await TourService.updateTourService(
      req.params.id,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Tour updated successfully",
      data: updatedTour,
    });
  }
);

const deleteTour = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await TourService.deleteTourService(req.params.id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Tour deleted successfully",
      data: null,
    });
  }
);

// Tour
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
