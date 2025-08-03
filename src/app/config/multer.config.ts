import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.config";
import multer from "multer";
// import { v4 as uuidv4 } from "uuid";

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload,
  params: {
    public_id: (req, file: Express.Multer.File) => {
      const fileName = file.originalname
        .toLowerCase()
        .replace(/\s+/g, "-") // for space removing
        .replace(/\./g, "-") // for dot removing
        // eslint-disable-next-line no-useless-escape
        .replace(/[^a-z0-9\-\.]/g, "");
      //   const uniqueFileName = `${uuidv4()}.${extension}`;
      const uniqueFileName =
        Math.random().toString(36).substring(2) +
        "-" +
        Date.now() +
        "-" +
        fileName;
      return uniqueFileName;
    },
  },
});

export const multerUpload = multer({ storage: storage });
