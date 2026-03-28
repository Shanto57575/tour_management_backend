import { Router } from "express";
import { GuideController } from "./guide.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { multerUpload } from "../../config/multer.config";
import { validateRequest } from "../../middlewares/validateRequest";
import { validateGuideUploadFiles } from "../../utils/validateGuideUploadFiles";
import {
  createGuideApplicationZodSchema,
  updateGuideActivationZodSchema,
  updateGuideApplicationZodSchema,
  updateGuideStatusZodSchema,
} from "./guide.validation";
import { GUIDE_APPLICATION_UPLOAD_FIELDS } from "./guide.constant";

const router = Router();

router.post(
  "/",
  checkAuth(Role.USER),
  multerUpload.fields(GUIDE_APPLICATION_UPLOAD_FIELDS),
  validateGuideUploadFiles,
  validateRequest(createGuideApplicationZodSchema),
  GuideController.applyForGuide,
);

router.get(
  "/my-application",
  checkAuth(Role.USER, Role.GUIDE),
  GuideController.getMyApplication,
);

router.get(
  "/my-profile",
  checkAuth(Role.GUIDE),
  GuideController.getMyGuideProfile,
);

router.patch(
  "/:id/status",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(updateGuideStatusZodSchema),
  GuideController.updateStatus,
);

router.patch(
  "/:id/activation",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(updateGuideActivationZodSchema),
  GuideController.updateActivation,
);

router.patch(
  "/:id/reapply",
  checkAuth(Role.USER, Role.GUIDE),
  multerUpload.fields(GUIDE_APPLICATION_UPLOAD_FIELDS),
  validateGuideUploadFiles,
  validateRequest(updateGuideApplicationZodSchema),
  GuideController.reapply,
);

router.get(
  "/available",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  GuideController.getAvailableGuides,
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
