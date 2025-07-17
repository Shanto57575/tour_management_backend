import { NextFunction, Request, Response } from "express";

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export const catchAsync =
  (fn: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      next(err);
    });
  };

// export function catchAsync2(fn: AsyncHandler) {
//   return function (req: Request, res: Response, next: NextFunction) {
//     Promise.resolve(fn(req, res, next)).catch((err) => {
//       console.log(err);
//       next(err);
//     });
//   };
// }
