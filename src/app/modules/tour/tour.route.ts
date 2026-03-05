import { Router } from "express";
import { TourController } from "./tour.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createTourTypeZodSchema,
  createTourZodSchema,
  updateTourTypeZodSchema,
  updateTourZodSchema,
} from "./tour.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { multerUpload } from "../../config/multer.config";

const router = Router();

// tour-types
router.post(
  "/create-tour-type",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(createTourTypeZodSchema),
  TourController.createTourType,
);

router.get("/tour-types", TourController.getAllTourTypes);

router.get(
  "/tour-types/:id",
  checkAuth(...Object.values(Role)),
  TourController.getSingleTourType,
);

router.patch(
  "/tour-types/:id",
  validateRequest(updateTourTypeZodSchema),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  TourController.updateTourType,
);

router.delete(
  "/tour-types/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  TourController.deleteTourType,
);

// tour
router.post(
  "/create",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  multerUpload.array("files"),
  validateRequest(createTourZodSchema),
  TourController.createTour,
);

router.get("/", TourController.getAllTour);

router.get("/:slug", TourController.getSingleTour);

router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  multerUpload.array("files"),
  validateRequest(updateTourZodSchema),
  TourController.updateTour,
);

router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  TourController.deleteTour,
);

export const TourRoutes = router;
