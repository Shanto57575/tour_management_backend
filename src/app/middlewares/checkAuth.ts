import httpStatus from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";
import { verifyToken } from "../utils/jwt";
import { envVars } from "../config/env";
import { JwtPayload } from "jsonwebtoken";

export const checkAuth =
  (...authRoles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.headers.authorization;

    if (!accessToken) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Token Not provided");
    }

    const verifiedToken = verifyToken(
      accessToken,
      envVars.JWT_ACCESS_SECRET
    ) as JwtPayload;

    if (!authRoles.includes(verifiedToken.role)) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized access");
    }

    req.user = verifiedToken;
    next();
  };
