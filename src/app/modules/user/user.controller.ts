/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { UserServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import { uploadBufferToCloudinary } from "../../config/cloudinary.config";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const user = await UserServices.createUserService(req.body);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User created successfully",
    data: user,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const verifiedToken = req.user;

  let userImage;
  if (req.file) {
    userImage = await uploadBufferToCloudinary(
      req.file.buffer,
      req.file.originalname,
    );
  }

  const payload = {
    ...req.body,
    picture: userImage?.secure_url,
  };

  const user = await UserServices.updateUserService(
    userId,
    payload,
    verifiedToken as JwtPayload,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User updated successfully",
    data: user,
  });
});

const getProfile = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;
  const result = await UserServices.getProfileService(decodedToken.userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User data retrieved successfully",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as Record<string, string>;

  const result = await UserServices.getAllUsersServices(query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All User retrieved successfully",
    data: result,
  });
});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getSingleUserService(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "user retrieved successfully",
    data: result,
  });
});

export const UserController = {
  createUser,
  getProfile,
  getAllUsers,
  getSingleUser,
  updateUser,
};
