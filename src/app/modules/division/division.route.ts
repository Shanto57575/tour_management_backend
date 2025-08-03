import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { divisionController } from "./division.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import {
  createDivisionZodSchema,
  updateDivisionZodSchema,
} from "./division.validation";
import { multerUpload } from "../../config/multer.config";

const router = Router();

router.post(
  "/create",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  multerUpload.single("file"),
  validateRequest(createDivisionZodSchema),
  divisionController.createDivision
);

router.get("/", divisionController.getAllDivision);

router.get("/:slug", divisionController.getSingleDivision);

router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  multerUpload.single("file"),
  validateRequest(updateDivisionZodSchema),
  divisionController.updateDivision
);

router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  divisionController.deleteDivision
);

export const DivisionRoutes = router;
