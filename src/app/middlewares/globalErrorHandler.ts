/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { handlerDuplicateError } from "../helpers/handlerDuplicateError";
import { handleCastError } from "../helpers/handleCastError";
import { handlerZodError } from "../helpers/handlerZodError";
import { TErrorSources } from "../interfaces/error.types";
import { handlerValidationError } from "../helpers/handlerValidationError";
import { deleteImageFromCloudinary } from "../config/cloudinary.config";

export const globalErrorHandler = async (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  if (envVars.NODE_ENV === "development") {
    console.log(err);
  }

  if (req.file) {
    await deleteImageFromCloudinary(req.file.path);
  }

  if (req.files && Array.isArray(req.files) && req.files.length) {
    const imageUrls = (req.files as Express.Multer.File[]).map(
      (file) => file.path
    );
    await Promise.all(imageUrls.map((url) => deleteImageFromCloudinary(url)));
  }

  let errorSources: any = [];
  let statusCode = 500;
  let message = "Something went wrong";

  if (err.code === 11000) {
    const simplifiedError = handlerDuplicateError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
  } else if (err.name === "CastError") {
    const simplifiedError = handleCastError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
  } else if (err.name === "ZodError") {
    const simplifiedError = handlerZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources as TErrorSources[];
  } else if (err.name === "ValidationError") {
    const simplifiedError = handlerValidationError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources as TErrorSources[];
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    statusCode = 500;
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    err: envVars.NODE_ENV === "development" ? err : null,
    stack: envVars.NODE_ENV === "development" ? err.stack : null,
  });
};
