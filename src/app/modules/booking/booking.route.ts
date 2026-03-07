import { Router } from "express";
import { BookingController } from "./booking.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createBookingZodSchema,
  updateBookingStatusZodSchema,
} from "./booking.validation";

const router = Router();

router.post(
  "/create-booking",
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

router.get(
  "/:bookingId",
  checkAuth(...Object.values(Role)),
  BookingController.getSingleBooking,
);

router.patch(
  "/:bookingId",
  checkAuth(...Object.values(Role)),
  validateRequest(updateBookingStatusZodSchema),
  BookingController.updateBookingStatus,
);

/**
 * POST /api/v1/booking/re-init-payment/:bookingId
 * Creates a new Stripe PaymentIntent for an existing PENDING/UNPAID booking.
 * Returns clientSecret so the frontend can open the Stripe checkout modal.
 */
router.post(
  "/re-init-payment/:bookingId",
  checkAuth(...Object.values(Role)),
  BookingController.reInitPayment,
);

export const BookingRoutes = router;
