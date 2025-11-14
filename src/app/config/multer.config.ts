import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  cb(null, true);
};

export const multerUpload = multer({
  storage,
  fileFilter,
});
