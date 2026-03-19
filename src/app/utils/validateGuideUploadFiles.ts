import type { NextFunction, Request, Response } from "express";

export const validateGuideUploadFiles = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const files = req.files as
    | Record<string, Express.Multer.File[]>
    | undefined;

  if (!files) {
    next();
    return;
  }

  const allFiles = Object.values(files).flat();

  for (const file of allFiles) {
    if (!file.mimetype.startsWith("image/")) {
      res.status(400).json({
        success: false,
        message: "Only image files are allowed",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      res.status(400).json({
        success: false,
        message: "Each image must be under 5MB",
      });
      return;
    }
  }

  next();
};
