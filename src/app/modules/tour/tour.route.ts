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

const router = Router();

// tour-types
router.post(
  "/create-tour-type",
  validateRequest(createTourTypeZodSchema),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  TourController.createTourType
);

router.get(
  "/tour-types",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  TourController.getAllTourTypes
);

router.get(
  "/tour-types/:id",
  checkAuth(...Object.values(Role)),
  TourController.getSingleTourType
);

router.patch(
  "/tour-types/:id",
  validateRequest(updateTourTypeZodSchema),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  TourController.updateTourType
);

router.delete(
  "/tour-types/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  TourController.deleteTourType
);

// tour
router.post(
  "/create",
  validateRequest(createTourZodSchema),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  TourController.createTour
);

router.get("/", checkAuth(...Object.values(Role)), TourController.getAllTour);

router.get(
  "/:slug",
  checkAuth(...Object.values(Role)),
  TourController.getSingleTour
);

router.patch(
  "/:id",
  validateRequest(updateTourZodSchema),
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  TourController.updateTour
);

router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  TourController.deleteTour
);

export const TourRoutes = router;
