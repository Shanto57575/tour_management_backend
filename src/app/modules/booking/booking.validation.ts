import mongoose from "mongoose";
import z from "zod";
import { BOOKING_STATUS } from "./booking.interface";

const objectIdSchema = (fieldName: string) =>
  z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
    message: `Invalid ObjectId for ${fieldName}`,
  });

const futureBookingDateSchema = z.coerce.date().refine((value) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  return value > startOfToday;
}, "Booking date must be in the future");

export const createBookingZodSchema = z.object({
  tour: objectIdSchema("tour"),
  guestCount: z.coerce
    .number({ invalid_type_error: "guest count must be a number" })
    .int("guest count must be an integer")
    .min(1, "Guest count must be at least 1"),
  bookingDate: futureBookingDateSchema,
  contactInfo: z.object({
    name: z
      .string({ invalid_type_error: "contact name must be string" })
      .min(1, "Contact name is required"),
    phone: z
      .string({ invalid_type_error: "contact phone must be string" })
      .min(1, "Contact phone is required"),
    email: z
      .string({ invalid_type_error: "contact email must be string" })
      .email("Invalid contact email")
      .optional(),
  }),
  specialRequests: z
    .string({ invalid_type_error: "special requests must be string" })
    .optional(),
});

export const cancelBookingZodSchema = z.object({
  cancellationReason: z
    .string({ invalid_type_error: "cancellation reason must be string" })
    .min(3, "Cancellation reason must be at least 3 characters")
    .optional(),
});

export const updateBookingStatusZodSchema = z.object({
  status: z.enum([BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CANCELLED]),
  reason: z
    .string({ invalid_type_error: "reason must be string" })
    .min(3, "reason must be at least 3 characters")
    .optional(),
});
