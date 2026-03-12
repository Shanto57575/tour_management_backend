import { Router } from "express";
import { DestinationController } from "./destination.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createDestinationZodSchema,
  updateDestinationZodSchema,
} from "./destination.validation";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { multerUpload } from "../../config/multer.config";

const router = Router();

router.post(
  "/create",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  multerUpload.array("files", 10),
  validateRequest(createDestinationZodSchema),
  DestinationController.createDestination,
);

router.get("/", DestinationController.getAllDestinations);

router.get("/:slug", DestinationController.getSingleDestination);

router.patch(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  multerUpload.array("files", 10),
  validateRequest(updateDestinationZodSchema),
  DestinationController.updateDestination,
);

router.delete(
  "/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  DestinationController.deleteDestination,
);

export const DestinationRoutes = router;
