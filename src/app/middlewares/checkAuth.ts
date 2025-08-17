import httpStatus from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";
import { verifyToken } from "../utils/jwt";
import { envVars } from "../config/env";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../modules/user/user.model";
import { IsActive } from "../modules/user/user.interface";

export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.headers.authorization || req.cookies.accessToken;

    if (!accessToken) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Token Not provided");
    }

    const verifiedToken = verifyToken(
      accessToken,
      envVars.JWT_ACCESS_SECRET
    ) as JwtPayload;

    const isUserExists = await User.findOne({
      email: verifiedToken.email,
    });

    if (!isUserExists) {
      throw new AppError(httpStatus.BAD_REQUEST, "user does not exist");
    }

    if (isUserExists.isActive == IsActive.BLOCKED) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `user is Blocked ${isUserExists.isActive}`
      );
    }

    if (isUserExists.isDeleted) {
      throw new AppError(httpStatus.BAD_REQUEST, "user is Deleted");
    }
    if (!isUserExists.isVerified) {
      throw new AppError(httpStatus.BAD_REQUEST, "user is not verified!");
    }

    if (!authRoles.includes(verifiedToken.role)) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized access");
    }

    req.user = verifiedToken;
    next();
  };
