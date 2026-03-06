import { Router } from "express";
import { GuideController } from "./guide.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { multerUpload } from "../../config/multer.config";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createGuideApplicationZodSchema,
  updateGuideStatusZodSchema,
} from "./guide.validation";

const router = Router();

router.post(
  "/apply",
  checkAuth(Role.USER),
  multerUpload.single("file"),
  validateRequest(createGuideApplicationZodSchema),
  GuideController.applyAsGuide,
);

router.get(
  "/my-application",
  checkAuth(Role.USER, Role.GUIDE),
  GuideController.getMyApplication,
);

router.patch(
  "/:id/status",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(updateGuideStatusZodSchema),
  GuideController.updateApplicationStatus,
);

router.patch(
  "/:id/archive",
  checkAuth(Role.ADMIN),
  GuideController.archiveApplication,
);

router.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  GuideController.getAllApplications,
);

router.get(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  GuideController.getSingleApplication,
);

export const GuideRoutes = router;
