"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchAsync = void 0;
const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
        next(err);
    });
};
exports.catchAsync = catchAsync;
// export function catchAsync2(fn: AsyncHandler) {
//   return function (req: Request, res: Response, next: NextFunction) {
//     Promise.resolve(fn(req, res, next)).catch((err) => {
//       console.log(err);
//       next(err);
//     });
//   };
// }
