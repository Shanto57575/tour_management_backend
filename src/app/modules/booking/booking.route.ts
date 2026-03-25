import { Router } from "express";
import { BookingController } from "./booking.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  cancelBookingZodSchema,
  createBookingZodSchema,
  updateBookingStatusZodSchema,
} from "./booking.validation";

const router = Router();

router.post(
  "/",
  checkAuth(...Object.values(Role)),
  validateRequest(createBookingZodSchema),
  BookingController.createBooking,
);

router.get(
  "/all-bookings",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  BookingController.getAllBookings,
);

router.get(
  "/my-bookings",
  checkAuth(...Object.values(Role)),
  BookingController.getUserBookings,
);

router.patch(
  "/:id/cancel",
  checkAuth(...Object.values(Role)),
  validateRequest(cancelBookingZodSchema),
  BookingController.cancelBooking,
);

router.patch(
  "/:id/status",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(updateBookingStatusZodSchema),
  BookingController.updateBookingStatus,
);

router.get(
  "/:bookingId",
  checkAuth(...Object.values(Role)),
  BookingController.getSingleBooking,
);

export const BookingRoutes = router;
