/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { divisionService } from "./division.service";

const createDivision = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = {
      ...req.body,
      thumbnail: req.file?.path,
    };
    const divisionInfo = await divisionService.createDivisionService(payload);
    console.log(divisionInfo);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "New Division created successfully",
      data: divisionInfo,
    });
  }
);

const getAllDivision = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const allDivision = await divisionService.getAllDivisionService(
      req.query as Record<string, string>
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All Divisions retrieved successfully",
      data: allDivision,
    });
  }
);

const getSingleDivision = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const division = await divisionService.getSingleDivisionService(
      req.params.slug
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "division retrieved successfully",
      data: division,
    });
  }
);

const updateDivision = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const divisionId = req.params.id;
    const payload = {
      ...req.body,
      thumbnail: req.file?.path,
    };
    const updatedDivision = await divisionService.updateDivisionService(
      divisionId,
      payload
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Division updated successfully",
      data: updatedDivision,
    });
  }
);

const deleteDivision = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await divisionService.DeleteDivisionService(req.params.id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Division Deleted successfully",
      data: null,
    });
  }
);

export const divisionController = {
  createDivision,
  getAllDivision,
  getSingleDivision,
  updateDivision,
  deleteDivision,
};
